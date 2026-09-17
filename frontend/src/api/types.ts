// Kanboard JSON-RPC API types.
// PicoDb returns most scalar columns as strings; numeric-looking fields are typed as
// `string | number` where the backend does not normalize them.

export type Id = number | string

export type Numeric = string | number

export interface Color {
  name: string
  background: string
  border: string
}

export type ColorList = Record<string, string>

export interface Project {
  id: Numeric
  name: string
  is_active: Numeric
  token: string
  last_modified: Numeric
  is_public: Numeric
  is_private: Numeric
  description: string | null
  identifier: string
  start_date: string
  end_date: string
  owner_id: Numeric
  priority_default: Numeric
  priority_start: Numeric
  priority_end: Numeric
  email: string | null
  predefined_email_subjects: string | null
  per_swimlane_task_limits: Numeric
  task_limit: Numeric
  enable_global_tags: Numeric
  url?: Record<string, string>
}

export interface Column {
  id: Numeric
  title: string
  position: Numeric
  project_id: Numeric
  task_limit: Numeric
  description: string
  hide_in_dashboard: Numeric
}

export interface Swimlane {
  id: Numeric
  name: string
  position: Numeric
  is_active: Numeric
  project_id: Numeric
  description: string
  task_limit: Numeric
}

export interface Category {
  id: Numeric
  name: string
  project_id: Numeric
  description: string
  color_id: string | null
}

export interface Tag {
  id: Numeric
  name: string
  project_id: Numeric
  color_id: string | null
}

export interface User {
  id: Numeric
  username: string
  name: string
  email: string
  role: AppRole
  is_active: Numeric
  is_ldap_user: Numeric
  avatar_path: string | null
  timezone: string
  language: string
  api_access_token?: string | null
}

export type AppRole = 'app-admin' | 'app-manager' | 'app-user' | 'app-public' | ''

export type ProjectRole = 'project-manager' | 'project-member' | 'project-viewer'

/** Mapping of user id => display name, as returned by `getAssignableUsers` / `getProjectUsers`. */
export type UserList = Record<string, string>

// --- Task -------------------------------------------------------------------

export const TASK_STATUS_OPEN = 1
export const TASK_STATUS_CLOSED = 0

export const RECURRING_STATUS_NONE = 0
export const RECURRING_STATUS_PENDING = 1
export const RECURRING_STATUS_PROCESSED = 2

export const RECURRING_TRIGGER_FIRST_COLUMN = 0
export const RECURRING_TRIGGER_LAST_COLUMN = 1
export const RECURRING_TRIGGER_CLOSE = 2

export const RECURRING_TIMEFRAME_DAYS = 0
export const RECURRING_TIMEFRAME_MONTHS = 1
export const RECURRING_TIMEFRAME_YEARS = 2

export const RECURRING_BASEDATE_DUEDATE = 0
export const RECURRING_BASEDATE_TRIGGERDATE = 1

export interface Task {
  id: Numeric
  title: string
  description: string
  date_creation: Numeric
  color_id: string
  project_id: Numeric
  column_id: Numeric
  owner_id: Numeric
  position: Numeric
  is_active: Numeric
  date_completed: Numeric | null
  score: Numeric
  date_due: Numeric
  category_id: Numeric
  creator_id: Numeric
  date_modification: Numeric
  reference: string
  date_started: Numeric
  time_spent: Numeric
  time_estimated: Numeric
  swimlane_id: Numeric
  date_moved: Numeric
  recurrence_status: Numeric
  recurrence_trigger: Numeric
  recurrence_factor: Numeric
  recurrence_timeframe: Numeric
  recurrence_basedate: Numeric
  recurrence_parent: Numeric | null
  recurrence_child: Numeric | null
  priority: Numeric
  external_provider: string | null
  external_uri: string | null
  /** Added by TaskApiFormatter */
  url?: string
  color?: Color
}

export interface CreateTaskParams {
  title: string
  project_id: Id
  color_id?: string
  column_id?: Id
  owner_id?: Id
  creator_id?: Id
  date_due?: string
  description?: string
  category_id?: Id
  score?: Numeric
  swimlane_id?: Id | null
  priority?: Numeric
  recurrence_status?: Numeric
  recurrence_trigger?: Numeric
  recurrence_factor?: Numeric
  recurrence_timeframe?: Numeric
  recurrence_basedate?: Numeric
  reference?: string
  tags?: string[]
  date_started?: string
  time_spent?: Numeric | null
  time_estimated?: Numeric | null
}

export interface UpdateTaskParams {
  id: Id
  title?: string
  color_id?: string
  owner_id?: Id
  date_due?: string
  description?: string
  category_id?: Id
  score?: Numeric
  priority?: Numeric
  recurrence_status?: Numeric
  recurrence_trigger?: Numeric
  recurrence_factor?: Numeric
  recurrence_timeframe?: Numeric
  recurrence_basedate?: Numeric
  reference?: string
  tags?: string[]
  date_started?: string
  time_spent?: Numeric | null
  time_estimated?: Numeric | null
}

export interface MoveTaskPositionParams {
  project_id: Id
  task_id: Id
  column_id: Id
  position: number
  swimlane_id: Id
}

export interface MoveOrDuplicateTaskParams {
  task_id: Id
  project_id: Id
  swimlane_id?: Id | null
  column_id?: Id | null
  category_id?: Id | null
  owner_id?: Id | null
}

// --- Subtask ----------------------------------------------------------------

export const SUBTASK_STATUS_TODO = 0
export const SUBTASK_STATUS_INPROGRESS = 1
export const SUBTASK_STATUS_DONE = 2

export type SubtaskStatus =
  | typeof SUBTASK_STATUS_TODO
  | typeof SUBTASK_STATUS_INPROGRESS
  | typeof SUBTASK_STATUS_DONE

export interface Subtask {
  id: Numeric
  title: string
  status: Numeric
  time_estimated: Numeric
  time_spent: Numeric
  task_id: Numeric
  user_id: Numeric
  position: Numeric
  /** Assignee username (joined) */
  username: string | null
  /** Assignee display name (joined) */
  name: string | null
  timer_start_date: Numeric
  status_name: string
  is_timer_started: boolean
}

export interface CreateSubtaskParams {
  task_id: Id
  title: string
  user_id?: Id
  time_estimated?: Numeric
  time_spent?: Numeric
  status?: Numeric
}

export interface UpdateSubtaskParams {
  id: Id
  task_id: Id
  title?: string
  user_id?: Id
  time_estimated?: Numeric
  time_spent?: Numeric
  status?: Numeric
  position?: number
}

// --- Comment ----------------------------------------------------------------

export type CommentVisibility = 'app-user' | 'app-manager' | 'app-admin'

export interface Comment {
  id: Numeric
  date_creation: Numeric
  date_modification: Numeric
  task_id: Numeric
  user_id: Numeric
  comment: string
  visibility: CommentVisibility
  reference?: string
  username: string | null
  name: string | null
  email: string | null
  avatar_path: string | null
}

export interface CreateCommentParams {
  task_id: Id
  user_id: Id
  content: string
  reference?: string
  visibility?: CommentVisibility
}

// --- Files ------------------------------------------------------------------

export interface TaskFile {
  id: Numeric
  name: string
  path: string
  is_image: Numeric
  task_id: Numeric
  date: Numeric
  user_id: Numeric
  size: Numeric
  username?: string | null
  user_name?: string | null
  etag: string
}

// --- Internal links ---------------------------------------------------------

export interface Link {
  id: Numeric
  label: string
  opposite_id: Numeric
}

export interface TaskLink {
  id: Numeric
  /** Id of the opposite task */
  task_id: Numeric
  label: string
  title: string
  is_active: Numeric
  project_id: Numeric
  column_id: Numeric
  color_id: string
  date_completed: Numeric | null
  date_started: Numeric
  date_due: Numeric
  task_time_spent: Numeric
  task_time_estimated: Numeric
  task_assignee_id: Numeric
  task_assignee_username: string | null
  task_assignee_name: string | null
  column_title: string
  project_name: string
}

// --- External links ---------------------------------------------------------

export type ExternalLinkTypes = Record<string, string>

export type ExternalLinkDependencies = Record<string, string>

export interface TaskExternalLink {
  id: Numeric
  link_type: string
  dependency: string
  title: string
  url: string
  date_creation: Numeric
  date_modification: Numeric
  task_id: Numeric
  creator_id: Numeric
  creator_name: string | null
  creator_username: string | null
  dependency_label: string
  type: string
}

export interface CreateExternalLinkParams {
  task_id: Id
  url: string
  dependency: string
  type?: string
  title?: string
}

export interface UpdateExternalLinkParams {
  task_id: Id
  link_id: Id
  title?: string
  url?: string
  dependency?: string
}

// --- Metadata / tags --------------------------------------------------------

export type TaskMetadata = Record<string, string>

/** tag id => tag name */
export type TaskTags = Record<string, string>

// --- Board ------------------------------------------------------------------

export interface BoardTask extends Task {
  assignee_username?: string | null
  assignee_name?: string | null
  category_name?: string | null
  nb_subtasks?: Numeric
  nb_completed_subtasks?: Numeric
  nb_comments?: Numeric
  nb_files?: Numeric
  tags?: Tag[]
}

export interface BoardColumn extends Column {
  tasks: BoardTask[]
  nb_tasks: number
  score: number
}

export interface BoardSwimlane extends Swimlane {
  columns: BoardColumn[]
  nb_columns: number
  nb_tasks: number
  score: number
}

export type Board = BoardSwimlane[]

/** Field-keyed validation errors, matching the shape produced by `SimpleValidator`. */
export type ValidationErrors = Record<string, string[]>
