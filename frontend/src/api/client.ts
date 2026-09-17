/**
 * Typed JSON-RPC 2.0 client for the Kanboard API (owned by Stream A).
 *
 * Talks to the `JsonRPC\Server` registered in app/ServiceProvider/ApiProvider.php.
 * Two transports share the same envelope:
 *  - `jsonrpc.php`            HTTP Basic / X-API-Auth (token based, legacy)
 *  - `?controller=ReactAppController&action=api` (or `/react/api`)
 *                             browser session cookie + X-CSRF-Token header
 *
 * Feature streams import `api` / `useApi` and add methods to `ApiMethods` in
 * types.ts; they never modify this file.
 */

import type {
  ApiMethodName,
  ApiParams,
  ApiResult,
  JsonRpcError,
  JsonRpcId,
  JsonRpcRequest,
  JsonRpcResponse,
  SessionBootstrap,
} from './types'
import { JsonRpcErrorCode } from './types'

export class ApiError extends Error {
  readonly code: number
  readonly data: unknown
  readonly method: string

  constructor(method: string, error: JsonRpcError) {
    super(`${method}: ${error.message}`)
    this.name = 'ApiError'
    this.code = error.code
    this.data = error.data
    this.method = method
  }

  get isUnauthorized(): boolean {
    return this.code === JsonRpcErrorCode.Unauthorized
  }

  get isForbidden(): boolean {
    return this.code === JsonRpcErrorCode.Forbidden
  }
}

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, statusText: string) {
    super(`HTTP ${status} ${statusText}`)
    this.name = 'HttpError'
    this.status = status
  }
}

export interface ClientOptions {
  /** JSON-RPC endpoint URL */
  url: string
  /** Extra headers sent with every request (e.g. X-CSRF-Token) */
  headers?: () => Record<string, string>
  /** Called when the server answers 401 / redirects to login */
  onUnauthorized?: () => void
  fetch?: typeof fetch
}

export interface BatchCall<M extends ApiMethodName = ApiMethodName> {
  method: M
  params: ApiParams<M>
}

let nextId = 1

export class JsonRpcClient {
  private readonly options: ClientOptions

  constructor(options: ClientOptions) {
    this.options = options
  }

  /** Invoke a single procedure; resolves with `result` or rejects with ApiError */
  async call<M extends ApiMethodName>(method: M, params: ApiParams<M>): Promise<ApiResult<M>> {
    const request: JsonRpcRequest<ApiParams<M>> = {
      jsonrpc: '2.0',
      method,
      params,
      id: nextId++,
    }

    const response = await this.send<ApiResult<M>>(request)

    if (response === null || Array.isArray(response)) {
      throw new ApiError(method, { code: JsonRpcErrorCode.InternalError, message: 'Unexpected response envelope' })
    }

    return this.unwrap(method, response)
  }

  /** Fire-and-forget notification (no id, server returns nothing) */
  async notify<M extends ApiMethodName>(method: M, params: ApiParams<M>): Promise<void> {
    await this.send({ jsonrpc: '2.0', method, params } as JsonRpcRequest<ApiParams<M>>)
  }

  /** Send several calls in one HTTP round trip; results are returned in call order */
  async batch<const T extends readonly BatchCall[]>(
    calls: T,
  ): Promise<{ [K in keyof T]: T[K] extends BatchCall<infer M> ? ApiResult<M> : never }> {
    const ids: JsonRpcId[] = []
    const requests: JsonRpcRequest[] = calls.map((call) => {
      const id = nextId++
      ids.push(id)
      return { jsonrpc: '2.0', method: call.method, params: call.params, id }
    })

    const responses = await this.send<unknown>(requests)
    const list = Array.isArray(responses) ? responses : responses ? [responses] : []
    const byId = new Map<JsonRpcId, JsonRpcResponse>(list.map((r) => [r.id, r]))

    return calls.map((call, index) => {
      const response = byId.get(ids[index])
      if (!response) {
        throw new ApiError(call.method, { code: JsonRpcErrorCode.InternalError, message: 'Missing batch response' })
      }
      return this.unwrap(call.method, response)
    }) as never
  }

  private unwrap<T>(method: string, response: JsonRpcResponse<T>): T {
    if ('error' in response) {
      const error = new ApiError(method, response.error)
      if (error.isUnauthorized) {
        this.options.onUnauthorized?.()
      }
      throw error
    }
    return response.result
  }

  private async send<T>(body: JsonRpcRequest | JsonRpcRequest[]): Promise<JsonRpcResponse<T> | JsonRpcResponse<T>[] | null> {
    const doFetch = this.options.fetch ?? fetch
    const res = await doFetch(this.options.url, {
      method: 'POST',
      credentials: 'same-origin',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...this.options.headers?.(),
      },
      body: JSON.stringify(body),
    })

    if (res.status === 401 || res.type === 'opaqueredirect') {
      this.options.onUnauthorized?.()
      throw new HttpError(401, 'Unauthorized')
    }

    const text = await res.text()

    if (text.trim() === '') {
      if (!res.ok) throw new HttpError(res.status, res.statusText)
      return null
    }

    let parsed: JsonRpcResponse<T> | JsonRpcResponse<T>[]
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new HttpError(res.status, res.ok ? 'Invalid JSON response' : res.statusText)
    }

    return parsed
  }
}

// ---------------------------------------------------------------------------
// Session bootstrap
// ---------------------------------------------------------------------------

const BOOTSTRAP_ELEMENT_ID = 'kanboard-bootstrap'

/** Read the bootstrap payload embedded by app/Template/react/shell.php */
export function readBootstrap(): SessionBootstrap | null {
  const el = document.getElementById(BOOTSTRAP_ELEMENT_ID)
  if (!el?.textContent) return null
  try {
    return JSON.parse(el.textContent) as SessionBootstrap
  } catch {
    return null
  }
}

/** Fetch the bootstrap payload from the session endpoint (dev server / refresh) */
export async function fetchBootstrap(sessionUrl: string): Promise<SessionBootstrap> {
  const res = await fetch(sessionUrl, {
    credentials: 'same-origin',
    redirect: 'manual',
    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  })
  if (res.status === 401 || res.type === 'opaqueredirect') {
    throw new HttpError(401, 'Unauthorized')
  }
  if (!res.ok) throw new HttpError(res.status, res.statusText)
  return (await res.json()) as SessionBootstrap
}

/** Default session endpoint when no bootstrap is embedded (Vite dev server) */
export const DEFAULT_SESSION_URL = '/index.php?controller=ReactAppController&action=session'

// ---------------------------------------------------------------------------
// Singleton used by the shell; configured once from the bootstrap payload
// ---------------------------------------------------------------------------

let session: SessionBootstrap | null = null
let client: JsonRpcClient | null = null

export function configureApi(bootstrap: SessionBootstrap, onUnauthorized?: () => void): JsonRpcClient {
  session = bootstrap
  client = new JsonRpcClient({
    url: bootstrap.apiUrl,
    headers: () => ({ 'X-CSRF-Token': session?.csrfToken ?? '' }),
    onUnauthorized:
      onUnauthorized ??
      (() => {
        window.location.assign(bootstrap.loginUrl)
      }),
  })
  return client
}

export function getSession(): SessionBootstrap {
  if (!session) throw new Error('API not configured: call configureApi() first')
  return session
}

export function getClient(): JsonRpcClient {
  if (!client) throw new Error('API not configured: call configureApi() first')
  return client
}

/** Shorthand: `api('getTask', { task_id: 1 })` */
export function api<M extends ApiMethodName>(method: M, params: ApiParams<M>): Promise<ApiResult<M>> {
  return getClient().call(method, params)
}

/** Stable TanStack Query key for a procedure call */
export function apiQueryKey<M extends ApiMethodName>(method: M, params: ApiParams<M>) {
  return ['jsonrpc', method, params] as const
}
