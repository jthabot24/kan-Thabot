import type { ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoginPage } from './auth/LoginPage'
import { Spinner } from './components/ui'
import { ProjectsPage } from './features/task/ProjectsPage'
import { TaskCreatePage } from './features/task/TaskCreatePage'
import { TaskDetailPage } from './features/task/TaskDetailPage'
import { displayName } from './features/task/format'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <>{children}</>
}

function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="app-header">
      <Link to="/" className="brand">
        Kanboard
      </Link>
      {user && (
        <span className="user-menu">
          {displayName(user.name, user.username)}{' '}
          <button type="button" className="btn-link" onClick={logout}>
            Logout
          </button>
        </span>
      )}
    </header>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <ProjectsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/projects/:projectId/tasks/new"
            element={
              <RequireAuth>
                <TaskCreatePage />
              </RequireAuth>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <RequireAuth>
                <TaskDetailPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
