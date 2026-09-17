import { useCallback, useEffect, useState } from 'react'
import * as api from '../../api/procedures'
import type {
  Category,
  Column,
  ColorList,
  Comment,
  Id,
  Link,
  Project,
  Subtask,
  Swimlane,
  Tag,
  Task,
  TaskExternalLink,
  TaskFile,
  TaskLink,
  TaskTags,
  User,
  UserList,
} from '../../api/types'
import { errorMessage } from '../../components/ui'
import { toNumber } from './format'

export interface ProjectContext {
  project: Project
  columns: Column[]
  swimlanes: Swimlane[]
  categories: Category[]
  users: UserList
  tags: Tag[]
  colors: ColorList
}

export async function loadProjectContext(projectId: Id): Promise<ProjectContext> {
  const [project, columns, swimlanes, categories, users, tags, colors] = await Promise.all([
    api.getProjectById(projectId),
    api.getColumns(projectId),
    api.getActiveSwimlanes(projectId),
    api.getAllCategories(projectId),
    api.getAssignableUsers(projectId, true),
    api.getTagsByProject(projectId),
    api.getColorList(),
  ])
  if (!project) throw new Error('Project not found')
  return { project, columns, swimlanes, categories, users, tags, colors }
}

export function useProjectContext(projectId: Id | null | undefined) {
  const [context, setContext] = useState<ProjectContext | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId === null || projectId === undefined) return
    let cancelled = false
    setContext(null)
    loadProjectContext(projectId)
      .then((value) => {
        if (!cancelled) setContext(value)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e))
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  return { context, error }
}

export interface TaskDetail {
  task: Task
  project: Project
  tags: TaskTags
  subtasks: Subtask[]
  comments: Comment[]
  internalLinks: TaskLink[]
  externalLinks: TaskExternalLink[]
  files: TaskFile[]
  linkLabels: Link[]
  columns: Column[]
  swimlanes: Swimlane[]
  categories: Category[]
  users: UserList
  assignee: User | null
  creator: User | null
  projectRole: string | null
}

export async function loadTaskDetail(taskId: Id, currentUserId: Id): Promise<TaskDetail> {
  const task = await api.getTask(taskId)
  if (!task) throw new Error(`Task #${taskId} not found`)

  const [project, tags, subtasks, comments, internalLinks, externalLinks, files, linkLabels, columns, swimlanes, categories, users, assignee, creator, projectRole] =
    await Promise.all([
      api.getProjectById(task.project_id),
      api.getTaskTags(task.id),
      api.getAllSubtasks(task.id),
      api.getAllComments(task.id),
      api.getAllTaskLinks(task.id),
      api.getAllExternalTaskLinks(task.id),
      api.getAllTaskFiles(task.id),
      api.getAllLinks(),
      api.getColumns(task.project_id),
      api.getActiveSwimlanes(task.project_id),
      api.getAllCategories(task.project_id),
      api.getAssignableUsers(task.project_id, true),
      toNumber(task.owner_id) ? api.getUser(task.owner_id) : Promise.resolve(false as const),
      toNumber(task.creator_id) ? api.getUser(task.creator_id) : Promise.resolve(false as const),
      api.getProjectUserRole(task.project_id, currentUserId).catch(() => null),
    ])

  if (!project) throw new Error('Project not found')

  return {
    task,
    project,
    tags,
    subtasks,
    comments,
    internalLinks,
    externalLinks,
    files,
    linkLabels,
    columns,
    swimlanes,
    categories,
    users,
    assignee: assignee || null,
    creator: creator || null,
    projectRole: projectRole || null,
  }
}

export function useTaskDetail(taskId: Id, currentUserId: Id) {
  const [detail, setDetail] = useState<TaskDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setError(null)
    loadTaskDetail(taskId, currentUserId)
      .then((value) => {
        if (!cancelled) setDetail(value)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e))
      })
    return () => {
      cancelled = true
    }
  }, [taskId, currentUserId, version])

  return { detail, error, refresh }
}
