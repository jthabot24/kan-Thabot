export class JsonRpcError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "JsonRpcError";
    this.code = code;
  }
}

const credentialsKey = "kanboard_credentials";
let requestId = 0;

export function setCredentials(username: string, password: string): void {
  sessionStorage.setItem(credentialsKey, JSON.stringify({ username, password }));
}

export function clearCredentials(): void {
  sessionStorage.removeItem(credentialsKey);
}

export function hasCredentials(): boolean {
  return sessionStorage.getItem(credentialsKey) !== null;
}

function readCredentials(): { username: string; password: string } | null {
  const value = sessionStorage.getItem(credentialsKey);
  if (!value) return null;
  try {
    return JSON.parse(value) as { username: string; password: string };
  } catch {
    clearCredentials();
    return null;
  }
}

export async function rpc<T>(
  method: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const credentials = readCredentials();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (credentials) {
    headers.Authorization = `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
  }
  const response = await fetch("/jsonrpc.php", {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", method, id: ++requestId, params }),
  });
  if (response.status === 401) throw new JsonRpcError(-32001, "Unauthorized");
  if (!response.ok) throw new JsonRpcError(response.status, response.statusText);
  const payload = (await response.json()) as {
    result?: T;
    error?: { code: number; message: string };
  };
  if (payload.error) throw new JsonRpcError(payload.error.code, payload.error.message);
  return payload.result as T;
}
