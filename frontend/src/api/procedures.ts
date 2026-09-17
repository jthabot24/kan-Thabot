import { rpc } from './client'
import type {
  Board,
  Category,
  Column,
  ColorList,
  Comment,
  CommentVisibility,
  CreateCommentParams,
  CreateExternalLinkParams,
  CreateSubtaskParams,
  CreateTaskParams,
  ExternalLinkDependencies,
  ExternalLinkTypes,
  Id,
  Link,
  MoveOrDuplicateTaskParams,
  MoveTaskPositionParams,
  Numeric,
  Project,
  Subtask,
  Swimlane,
  Tag,
  Task,
  TaskExternalLink,
  TaskFile,
  TaskLink,
  TaskMetadata,
  TaskTags,
  UpdateExternalLinkParams,
  UpdateSubtaskParams,
  UpdateTaskParams,
  User,
  UserList,
} from './types'

// MeProcedure / UserProcedure
export const getMe = () => rpc<User>('getMe')
export const getUser = (user_id: Id) => rpc<User | false>('getUser', { user_id })

// AppProcedure
export const getColorList = () => rpc<ColorList>('getColorList')
export const getDefaultTaskColor = () => rpc<string>('getDefaultTaskColor')

// ProjectProcedure and friends
export const getProjectById = (project_id: Id) => rpc<Project | false>('getProjectById', { project_id })
export const getMyProjects = () => rpc<Project[]>('getMyProjects')
export const getColumns = (project_id: Id) => rpc<Column[]>('getColumns', { project_id })
export const getActiveSwimlanes = (project_id: Id) => rpc<Swimlane[]>('getActiveSwimlanes', { project_id })
export const getAllCategories = (project_id: Id) => rpc<Category[]>('getAllCategories', { project_id })
export const getTagsByProject = (project_id: Id) => rpc<Tag[]>('getTagsByProject', { project_id })
export const getAssignableUsers = (project_id: Id, prepend_unassigned = false) =>
  rpc<UserList>('getAssignableUsers', { project_id, prepend_unassigned })
export const getProjectUserRole = (project_id: Id, user_id: Id) =>
  rpc<string | false>('getProjectUserRole', { project_id, user_id })
export const getBoard = (project_id: Id) => rpc<Board>('getBoard', { project_id })

// TaskProcedure
export const getTask = (task_id: Id) => rpc<Task | null>('getTask', { task_id })
export const searchTasks = (project_id: Id, query: string) => rpc<Task[]>('searchTasks', { project_id, query })
export const createTask = (params: CreateTaskParams) => rpc<Numeric | false>('createTask', params)
export const updateTask = (params: UpdateTaskParams) => rpc<boolean>('updateTask', params)
export const openTask = (task_id: Id) => rpc<boolean>('openTask', { task_id })
export const closeTask = (task_id: Id) => rpc<boolean>('closeTask', { task_id })
export const removeTask = (task_id: Id) => rpc<boolean>('removeTask', { task_id })
export const moveTaskPosition = (params: MoveTaskPositionParams) => rpc<boolean>('moveTaskPosition', params)
export const moveTaskToProject = (params: MoveOrDuplicateTaskParams) => rpc<boolean>('moveTaskToProject', params)
export const duplicateTaskToProject = (params: MoveOrDuplicateTaskParams) =>
  rpc<Numeric | false>('duplicateTaskToProject', params)

// TaskTagProcedure / TaskMetadataProcedure
export const getTaskTags = (task_id: Id) => rpc<TaskTags>('getTaskTags', { task_id })
export const setTaskTags = (project_id: Id, task_id: Id, tags: string[]) =>
  rpc<boolean>('setTaskTags', { project_id, task_id, tags })
export const getTaskMetadata = (task_id: Id) => rpc<TaskMetadata>('getTaskMetadata', { task_id })
export const saveTaskMetadata = (task_id: Id, values: TaskMetadata) =>
  rpc<boolean>('saveTaskMetadata', { task_id, values })

// SubtaskProcedure / SubtaskTimeTrackingProcedure
export const getAllSubtasks = (task_id: Id) => rpc<Subtask[]>('getAllSubtasks', { task_id })
export const createSubtask = (params: CreateSubtaskParams) => rpc<Numeric | false>('createSubtask', params)
export const updateSubtask = (params: UpdateSubtaskParams) => rpc<boolean>('updateSubtask', params)
export const removeSubtask = (subtask_id: Id) => rpc<boolean>('removeSubtask', { subtask_id })
export const hasSubtaskTimer = (subtask_id: Id, user_id: Id) =>
  rpc<boolean>('hasSubtaskTimer', { subtask_id, user_id })
export const setSubtaskStartTime = (subtask_id: Id, user_id: Id) =>
  rpc<boolean>('setSubtaskStartTime', { subtask_id, user_id })
export const setSubtaskEndTime = (subtask_id: Id, user_id: Id) =>
  rpc<boolean>('setSubtaskEndTime', { subtask_id, user_id })
export const getSubtaskTimeSpent = (subtask_id: Id, user_id: Id) =>
  rpc<number>('getSubtaskTimeSpent', { subtask_id, user_id })

// CommentProcedure
export const getAllComments = (task_id: Id) => rpc<Comment[]>('getAllComments', { task_id })
export const createComment = (params: CreateCommentParams) => rpc<Numeric | false>('createComment', params)
export const updateComment = (id: Id, content: string) => rpc<boolean>('updateComment', { id, content })
export const removeComment = (comment_id: Id) => rpc<boolean>('removeComment', { comment_id })

// TaskFileProcedure
export const getAllTaskFiles = (task_id: Id) => rpc<TaskFile[]>('getAllTaskFiles', { task_id })
export const downloadTaskFile = (file_id: Id) => rpc<string>('downloadTaskFile', { file_id })
export const createTaskFile = (project_id: Id, task_id: Id, filename: string, blob: string) =>
  rpc<Numeric | false>('createTaskFile', { project_id, task_id, filename, blob })
export const removeTaskFile = (file_id: Id) => rpc<boolean>('removeTaskFile', { file_id })

// LinkProcedure / TaskLinkProcedure
export const getAllLinks = () => rpc<Link[]>('getAllLinks')
export const getAllTaskLinks = (task_id: Id) => rpc<TaskLink[]>('getAllTaskLinks', { task_id })
export const createTaskLink = (task_id: Id, opposite_task_id: Id, link_id: Id) =>
  rpc<Numeric | false>('createTaskLink', { task_id, opposite_task_id, link_id })
export const updateTaskLink = (task_link_id: Id, task_id: Id, opposite_task_id: Id, link_id: Id) =>
  rpc<boolean>('updateTaskLink', { task_link_id, task_id, opposite_task_id, link_id })
export const removeTaskLink = (task_link_id: Id) => rpc<boolean>('removeTaskLink', { task_link_id })

// TaskExternalLinkProcedure
export const getExternalTaskLinkTypes = () => rpc<ExternalLinkTypes>('getExternalTaskLinkTypes')
export const getExternalTaskLinkProviderDependencies = (providerName: string) =>
  rpc<ExternalLinkDependencies | false>('getExternalTaskLinkProviderDependencies', { providerName })
export const getAllExternalTaskLinks = (task_id: Id) =>
  rpc<TaskExternalLink[]>('getAllExternalTaskLinks', { task_id })
export const createExternalTaskLink = (params: CreateExternalLinkParams) =>
  rpc<Numeric | false>('createExternalTaskLink', params)
export const updateExternalTaskLink = (params: UpdateExternalLinkParams) =>
  rpc<boolean>('updateExternalTaskLink', params)
export const removeExternalTaskLink = (task_id: Id, link_id: Id) =>
  rpc<boolean>('removeExternalTaskLink', { task_id, link_id })

export type { CommentVisibility }
