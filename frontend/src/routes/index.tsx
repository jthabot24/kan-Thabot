import { Navigate, createBrowserRouter, createHashRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

import { NotFound } from '@/pages/NotFound'
import { Placeholder } from '@/pages/Placeholder'
import { Layout } from '@/shell/Layout'
import type { SessionBootstrap } from '@/api/types'

/**
 * Client-side routes mirroring app/ServiceProvider/RouteProvider.php.
 * Only Stream A edits this table; feature streams swap the `element` of their
 * own area for their page component.
 */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // Dashboard (Stream B)
      { path: 'dashboard', element: <Placeholder area="dashboard" title="Dashboard" stream="Stream B" /> },
      { path: 'dashboard/:user_id', element: <Placeholder area="dashboard" title="Dashboard" stream="Stream B" /> },
      { path: 'dashboard/:user_id/:tab', element: <Placeholder area="dashboard" title="Dashboard" stream="Stream B" /> },

      // Projects (Stream C)
      { path: 'projects', element: <Placeholder area="projects" title="Projects" stream="Stream C" /> },
      { path: 'project/:project_id', element: <Placeholder area="project" title="Project" stream="Stream C" /> },
      { path: 'p/:project_id', element: <Placeholder area="project" title="Project" stream="Stream C" /> },

      // Board (Stream D)
      { path: 'board/:project_id', element: <Placeholder area="board" title="Board" stream="Stream D" /> },
      { path: 'b/:project_id', element: <Placeholder area="board" title="Board" stream="Stream D" /> },

      // Task (Stream E)
      { path: 'task/:task_id', element: <Placeholder area="task" title="Task" stream="Stream E" /> },
      { path: 't/:task_id', element: <Placeholder area="task" title="Task" stream="Stream E" /> },
      { path: 'project/:project_id/task/:task_id', element: <Placeholder area="task" title="Task" stream="Stream E" /> },

      // Settings (Stream F)
      { path: 'settings', element: <Placeholder area="settings" title="Settings" stream="Stream F" /> },
      { path: 'settings/*', element: <Placeholder area="settings" title="Settings" stream="Stream F" /> },

      // Analytics (Stream F)
      { path: 'analytics/:report/:project_id', element: <Placeholder area="analytics" title="Analytics" stream="Stream F" /> },
      { path: 'analytics/*', element: <Placeholder area="analytics" title="Analytics" stream="Stream F" /> },

      { path: '*', element: <NotFound /> },
    ],
  },
]

/**
 * With ENABLE_URL_REWRITE the PHP router serves the shell for /board/1 etc.
 * so we can use real paths under the app base URL; otherwise fall back to
 * hash routing (index.php?controller=ReactAppController&action=show#/board/1).
 */
export function createAppRouter(session: SessionBootstrap) {
  if (session.urlRewrite) {
    return createBrowserRouter(routes, { basename: session.baseUrl.replace(/\/$/, '') || '/' })
  }
  return createHashRouter(routes)
}
