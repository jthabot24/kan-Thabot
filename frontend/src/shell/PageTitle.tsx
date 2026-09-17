import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export interface PageTitleState {
  title: string
  project?: { id: string | number; name: string }
}

interface PageTitleContextValue extends PageTitleState {
  setPageTitle: (state: PageTitleState) => void
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null)

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [state, setPageTitle] = useState<PageTitleState>({ title: 'Kanboard' })
  const value = useMemo(() => ({ ...state, setPageTitle }), [state])

  useEffect(() => {
    document.title = state.project ? `${state.title} - ${state.project.name}` : state.title
  }, [state])

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
}

export function usePageTitle(): PageTitleContextValue {
  const ctx = useContext(PageTitleContext)
  if (!ctx) throw new Error('usePageTitle must be used inside <PageTitleProvider>')
  return ctx
}

/** Pages call `useSetPageTitle('Board', project)` to drive the header title */
export function useSetPageTitle(title: string, project?: PageTitleState['project']) {
  const { setPageTitle } = usePageTitle()
  const id = project?.id
  const name = project?.name
  useEffect(() => {
    setPageTitle(id !== undefined && name !== undefined ? { title, project: { id, name } } : { title })
  }, [title, id, name, setPageTitle])
}
