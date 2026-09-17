import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiProvider, BootstrapContext } from './api/ApiProvider'
import { createClient, loadBootstrap } from './api/client'
import App from './App'
import './index.css'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

async function render() {
  const bootstrap = await loadBootstrap()
  const client = createClient(bootstrap)
  const queryClient = new QueryClient()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BootstrapContext.Provider value={bootstrap}>
          <ApiProvider client={client}>
            <BrowserRouter basename={trimTrailingSlash(bootstrap.base_url)}>
              <App />
            </BrowserRouter>
          </ApiProvider>
        </BootstrapContext.Provider>
      </QueryClientProvider>
    </StrictMode>,
  )
}

render().catch((error: unknown) => {
  const root = document.getElementById('root')
  if (root) root.textContent = error instanceof Error ? error.message : 'Unable to load Kanboard'
})
