export interface JsonRpcError {
  code: number
  message: string
  data?: unknown
}

export class ApiError extends Error {
  code: number
  data?: unknown

  constructor(error: JsonRpcError) {
    super(error.message)
    this.name = 'ApiError'
    this.code = error.code
    this.data = error.data
  }
}

interface JsonRpcResponse<T> {
  jsonrpc: '2.0'
  id: number
  result?: T
  error?: JsonRpcError
}

export interface Credentials {
  username: string
  password: string
}

const CREDENTIALS_KEY = 'kanboard.credentials'

export function getCredentials(): Credentials | null {
  const raw = sessionStorage.getItem(CREDENTIALS_KEY)
  return raw ? (JSON.parse(raw) as Credentials) : null
}

export function setCredentials(credentials: Credentials | null): void {
  if (credentials) {
    sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials))
  } else {
    sessionStorage.removeItem(CREDENTIALS_KEY)
  }
}

export const API_ENDPOINT: string = import.meta.env.VITE_API_ENDPOINT ?? '/jsonrpc.php'

let requestId = 0

function authHeader(): Record<string, string> {
  const credentials = getCredentials()
  if (!credentials) return {}
  const token = btoa(`${credentials.username}:${credentials.password}`)
  return { Authorization: `Basic ${token}` }
}

export type RpcParams = object | unknown[]

export async function rpc<T>(method: string, params: RpcParams = {}): Promise<T> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ jsonrpc: '2.0', method, id: ++requestId, params }),
  })

  if (response.status === 401) {
    throw new ApiError({ code: 401, message: 'Authentication required' })
  }

  const payload = (await response.json()) as JsonRpcResponse<T>
  if (payload.error) {
    throw new ApiError(payload.error)
  }
  return payload.result as T
}
