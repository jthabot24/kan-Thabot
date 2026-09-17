import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { RouterProvider } from 'react-router-dom'

import { DEFAULT_SESSION_URL, HttpError, configureApi, fetchBootstrap, readBootstrap } from '@/api/client'
import type { SessionBootstrap } from '@/api/types'
import { createAppRouter } from '@/routes'
import { FlashProvider } from '@/shell/FlashMessages'
import { PageTitleProvider } from '@/shell/PageTitle'

import './shell/shell.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 10_000 },
  },
})

export function App() {
  const [session, setSession] = useState<SessionBootstrap | null>(() => readBootstrap())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) return
    fetchBootstrap(DEFAULT_SESSION_URL)
      .then(setSession)
      .catch((e: unknown) => {
        if (e instanceof HttpError && e.status === 401) {
          window.location.assign('/index.php?controller=AuthController&action=login')
          return
        }
        setError(e instanceof Error ? e.message : String(e))
      })
  }, [session])

  const router = useMemo(() => {
    if (!session) return null
    configureApi(session)
    return createAppRouter(session)
  }, [session])

  if (error) {
    return (
      <section className="page">
        <div className="alert alert-error">Unable to load session: {error}</div>
      </section>
    )
  }

  if (!session || !router) {
    return <div className="react-loading">Loading…</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <FlashProvider initial={session.flash}>
        <PageTitleProvider>
          <RouterProvider router={router} />
        </PageTitleProvider>
      </FlashProvider>
    </QueryClientProvider>
  )
}
