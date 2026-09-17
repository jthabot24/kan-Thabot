import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { AnalyticsPage } from './features/analytics/AnalyticsPage'
import { BoardPage } from './features/board/BoardPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { NotFoundPage } from './features/not-found/NotFoundPage'
import { ProjectPage } from './features/project/ProjectPage'
import { ProjectsPage } from './features/projects/ProjectsPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { TaskPage } from './features/task/TaskPage'

const area = (path: string, element: ReactNode): RouteObject => ({ path, element })

export const routes: RouteObject[] = [
  area('/', <DashboardPage />),
  area('/dashboard', <DashboardPage />),
  area('/dashboard/:user_id', <DashboardPage />),
  area('/board/:project_id', <BoardPage />),
  area('/b/:project_id', <BoardPage />),
  area('/task/:task_id', <TaskPage />),
  area('/project/:project_id', <ProjectPage />),
  area('/p/:project_id', <ProjectPage />),
  area('/projects', <ProjectsPage />),
  area('/settings', <SettingsPage />),
  area('/analytics/tasks/:project_id', <AnalyticsPage />),
  area('/analytics/users/:project_id', <AnalyticsPage />),
  area('/analytics/cfd/:project_id', <AnalyticsPage />),
  area('/analytics/burndown/:project_id', <AnalyticsPage />),
  area('/analytics/average-time-column/:project_id', <AnalyticsPage />),
  area('/analytics/lead-cycle-time/:project_id', <AnalyticsPage />),
  area('/analytics/estimated-spent-time/:project_id', <AnalyticsPage />),
  area('*', <NotFoundPage />),
]
