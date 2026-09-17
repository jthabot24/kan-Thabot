import type { ApiMethods, Bootstrap, JsonRpcErrorObject, JsonRpcResponse } from './types'

export class JsonRpcError extends Error {
  code: number
  data?: unknown

  constructor(error: JsonRpcErrorObject) {
    super(error.message)
    this.name = 'JsonRpcError'
    this.code = error.code
    this.data = error.data
  }
}

export class ApiClient {
  private endpoint: string
  private csrfToken: string
  private nextId = 1
  private onUnauthenticated?: () => void

  constructor(opts: { endpoint: string; csrfToken: string; onUnauthenticated?: () => void }) {
    this.endpoint = opts.endpoint
    this.csrfToken = opts.csrfToken
    this.onUnauthenticated = opts.onUnauthenticated
  }

  setCsrfToken(token: string) {
    this.csrfToken = token
  }

  call<M extends keyof ApiMethods>(
    method: M,
    params?: ApiMethods[M]['params'],
  ): Promise<ApiMethods[M]['result']> {
    return this.callRaw<ApiMethods[M]['result']>(method as string, params)
  }

  async callRaw<T = unknown>(method: string, params?: unknown): Promise<T> {
    const response = await this.send([{ method, params }])
    return this.result<T>(response[0])
  }

  async batch(requests: Array<{ method: string; params?: unknown }>): Promise<JsonRpcResponse<unknown>[]> {
    return this.send(requests)
  }

  private async send(requests: Array<{ method: string; params?: unknown }>) {
    const payload = requests.map((request) => {
      const value: Record<string, unknown> = {
        jsonrpc: '2.0',
        method: request.method,
        id: this.nextId++,
      }
      if (request.params !== undefined) value.params = request.params
      return value
    })
    const response = await fetch(this.endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': this.csrfToken,
      },
      body: JSON.stringify(requests.length === 1 ? payload[0] : payload),
    })
    const body = await response.json().catch(() => null)

    if (response.status === 401) {
      this.onUnauthenticated?.()
      throw new JsonRpcError({ code: -32001, message: 'Not authenticated' })
    }
    if (!response.ok) {
      if (body?.error) throw new JsonRpcError(body.error)
      throw new JsonRpcError({ code: response.status, message: response.statusText || 'Request failed' })
    }

    return (Array.isArray(body) ? body : [body]) as JsonRpcResponse<unknown>[]
  }

  private result<T>(response: JsonRpcResponse<unknown>) {
    if ('error' in response) throw new JsonRpcError(response.error)
    return response.result as T
  }
}

export async function loadBootstrap(): Promise<Bootstrap> {
  if (window.__KANBOARD__) return window.__KANBOARD__

  const response = await fetch('/api/session/bootstrap', {
    credentials: 'same-origin',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })
  if (!response.ok) throw new Error(`Unable to load bootstrap (${response.status})`)
  return response.json() as Promise<Bootstrap>
}

export function createClient(bootstrap: Bootstrap) {
  return new ApiClient({
    endpoint: `${bootstrap.base_url}api/session/rpc`,
    csrfToken: bootstrap.csrf_token,
  })
}
