import { createContext, useContext, type PropsWithChildren } from 'react'
import { ApiClient } from './client'
import type { Bootstrap } from './types'

const ApiContext = createContext<ApiClient | null>(null)
export const BootstrapContext = createContext<Bootstrap | null>(null)

export function ApiProvider({ client, children }: PropsWithChildren<{ client: ApiClient }>) {
  return <ApiContext.Provider value={client}>{children}</ApiContext.Provider>
}

export function useApi() {
  const value = useContext(ApiContext)
  if (!value) throw new Error('ApiProvider is missing')
  return value
}

export function useBootstrap() {
  const value = useContext(BootstrapContext)
  if (!value) throw new Error('ApiProvider is missing')
  return value
}
