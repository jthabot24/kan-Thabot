/**
 * Shared API types mirroring the JSON-RPC procedure / formatter output.
 *
 * ADDITIVE-ONLY FILE (owned by Stream A).
 * Feature streams may APPEND new exports at the bottom of this file, inside
 * their own clearly labelled section. Never edit, rename or remove existing
 * entries: other streams compile against them.
 *
 * Kanboard's API returns most scalar columns as strings (PDO), so numeric ids
 * and timestamps are typed as `string | number` unless the procedure casts.
 */

/** PDO returns numbers as strings for most drivers */
export type NumericString = string | number
/** Unix timestamp as returned by the database */
export type Timestamp = NumericString
/** 0/1 flags stored as tinyint */
export type Flag = '0' | '1' | 0 | 1 | boolean

// ---------------------------------------------------------------------------
// JSON-RPC 2.0 envelope (libs/jsonrpc ResponseBuilder)
// ---------------------------------------------------------------------------

export type JsonRpcId = string | number | null

export interface JsonRpcRequest<TParams = unknown> {
  jsonrpc: '2.0'
  method: string
  params?: TParams
  id: JsonRpcId
}

export interface JsonRpcError {
  code: number
  message: string
  data?: unknown
}

export interface JsonRpcSuccessResponse<TResult = unknown> {
  jsonrpc: '2.0'
  result: TResult
  id: JsonRpcId
}

export interface JsonRpcErrorResponse {
  jsonrpc: '2.0'
  error: JsonRpcError
  id: JsonRpcId
}

export type JsonRpcResponse<TResult = unknown> =
  | JsonRpcSuccessResponse<TResult>
  | JsonRpcErrorResponse

/** Standard error codes emitted by JsonRPC\Response\ResponseBuilder */
export const JsonRpcErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  Unauthorized: 401,
  Forbidden: 403,
} as const

// ---------------------------------------------------------------------------
// Session bootstrap (ReactAppController::getBootstrapData)
// ---------------------------------------------------------------------------

export type AppRole = 'app-admin' | 'app-manager' | 'app-user' | 'app-public'
export type ProjectRole = 'project-manager' | 'project-member' | 'project-viewer'

export interface FlashMessage {
  type: 'success' | 'failure'
  message: string
}

export interface SessionUser {
  id: number
  username: string
  name: string
  email: string
  role: AppRole | string
  avatar_path: string
  theme: string
  is_admin: boolean
  has_notifications: boolean
}

export interface SessionPermissions {
  create_project: boolean
  create_private_project: boolean
  manage_users: boolean
  manage_settings: boolean
  manage_plugins: boolean
}

export interface SessionBootstrap {
  baseUrl: string
  urlRewrite: boolean
  apiUrl: string
  sessionUrl: string
  loginUrl: string
  logoutUrl: string | null
  documentationUrl: string
  csrfToken: string
  language: string
  timezone: string
  dateFormat: string
  user: SessionUser
  permissions: SessionPermissions
  flash: FlashMessage[]
}

// ---------------------------------------------------------------------------
// Task (TaskProcedure + TaskApiFormatter)
// ---------------------------------------------------------------------------

export const TaskStatus = {
  Closed: 0,
  Open: 1,
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export interface TaskColor {
  name: string
  background: string
  border: string
}

export interface Task {
  id: NumericString
  title: string
  description: string
  date_creation: Timestamp
  color_id: string
  project_id: NumericString
  column_id: NumericString
  owner_id: NumericString
  position: NumericString
  is_active: Flag
  date_completed: Timestamp | null
  score: NumericString
  date_due: Timestamp
  category_id: NumericString
  creator_id: NumericString
  date_modification: Timestamp
  reference: string
  date_started: Timestamp
  time_spent: NumericString
  time_estimated: NumericString
  swimlane_id: NumericString
  date_moved: Timestamp
  recurrence_status: NumericString
  recurrence_trigger: NumericString
  recurrence_factor: NumericString
  recurrence_timeframe: NumericString
  recurrence_basedate: NumericString
  recurrence_parent: NumericString | null
  recurrence_child: NumericString | null
  priority: NumericString
  external_provider: string | null
  external_uri: string | null
  /** Added by TaskApiFormatter */
  url: string
  /** Added by TaskApiFormatter */
  color: TaskColor
}

/** Partial task row as returned by TaskModel::getOverdueTasks* */
export interface OverdueTask {
  id: NumericString
  title: string
  date_due: Timestamp
  project_id: NumericString
  project_name: string
  assignee_username: string | null
  assignee_name: string | null
}

export interface CreateTaskParams {
  title: string
  project_id: number
  color_id?: string
  column_id?: number
  owner_id?: number
  creator_id?: number
  date_due?: string
  description?: string
  category_id?: number
  score?: number
  swimlane_id?: number
  priority?: number
  recurrence_status?: number
  recurrence_trigger?: number
  recurrence_factor?: number
  recurrence_timeframe?: number
  recurrence_basedate?: number
  reference?: string
  tags?: string[]
  date_started?: string
  time_spent?: number
  time_estimated?: number
}

export interface UpdateTaskParams {
  id: number
  title?: string
  color_id?: string
  owner_id?: number
  date_due?: string
  description?: string
  category_id?: number
  score?: number
  priority?: number
  recurrence_status?: number
  recurrence_trigger?: number
  recurrence_factor?: number
  recurrence_timeframe?: number
  recurrence_basedate?: number
  reference?: string
  tags?: string[]
  date_started?: string
  time_spent?: number
  time_estimated?: number
}

// ---------------------------------------------------------------------------
// Project (ProjectProcedure + ProjectApiFormatter)
// ---------------------------------------------------------------------------

export interface ProjectUrls {
  board: string
  list: string
  calendar?: string
}

export interface Project {
  id: NumericString
  name: string
  is_active: Flag
  token: string
  last_modified: Timestamp
  is_public: Flag
  is_private: Flag
  default_swimlane: string
  show_default_swimlane: Flag
  description: string | null
  identifier: string
  start_date: string
  end_date: string
  owner_id: NumericString
  priority_default: NumericString
  priority_start: NumericString
  priority_end: NumericString
  email: string | null
  predefined_email_subjects: string | null
  per_swimlane_task_limits: Flag
  task_limit: NumericString
  enable_global_tags: Flag
  /** Added by ProjectApiFormatter */
  url: ProjectUrls
}

export interface ProjectActivity {
  id: NumericString
  date_creation: Timestamp
  event_name: string
  creator_id: NumericString
  project_id: NumericString
  task_id: NumericString
  author_username: string
  author_name: string | null
  email: string
  task: Task
  changes?: Record<string, unknown>
  author: string
  event_title: string
  event_content: string
}

export interface CreateProjectParams {
  name: string
  description?: string
  owner_id?: number
  identifier?: string
  start_date?: string
  end_date?: string
}

export interface UpdateProjectParams {
  project_id: number
  name?: string
  description?: string
  owner_id?: number
  identifier?: string
  start_date?: string
  end_date?: string
}

// ---------------------------------------------------------------------------
// User (UserProcedure)
// ---------------------------------------------------------------------------

export interface User {
  id: NumericString
  username: string
  is_ldap_user: Flag
  name: string | null
  email: string | null
  google_id: string | null
  github_id: string | null
  notifications_enabled: Flag
  timezone: string | null
  language: string | null
  disable_login_form: Flag
  twofactor_activated: Flag
  twofactor_secret: string | null
  token: string
  notifications_filter: NumericString
  nb_failed_login: NumericString
  lock_expiration_date: Timestamp
  gitlab_id: string | null
  role: AppRole | string
  is_active: Flag
  avatar_path: string | null
  api_access_token: string | null
  filter: string | null
  theme: string | null
}

export interface CreateUserParams {
  username: string
  password: string
  name?: string
  email?: string
  role?: AppRole
}

export interface UpdateUserParams {
  id: number
  username?: string
  name?: string
  email?: string
  role?: AppRole
}

// ---------------------------------------------------------------------------
// Method catalogue: JSON-RPC method name -> [params, result]
// Feature streams append to this map via declaration merging in their own
// files (`declare module '@/api/types' { interface ApiMethods { ... } }`)
// or by appending to this interface below their section marker.
// ---------------------------------------------------------------------------

export interface ApiMethods {
  // TaskProcedure
  getTask: { params: { task_id: number }; result: Task | false }
  getTaskByReference: { params: { project_id: number; reference: string }; result: Task | false }
  getAllTasks: { params: { project_id: number; status_id?: TaskStatus }; result: Task[] }
  getOverdueTasks: { params: Record<string, never>; result: OverdueTask[] }
  getOverdueTasksByProject: { params: { project_id: number }; result: OverdueTask[] }
  openTask: { params: { task_id: number }; result: boolean }
  closeTask: { params: { task_id: number }; result: boolean }
  removeTask: { params: { task_id: number }; result: boolean }
  moveTaskPosition: {
    params: { project_id: number; task_id: number; column_id: number; position: number; swimlane_id: number }
    result: boolean
  }
  moveTaskToProject: {
    params: { task_id: number; project_id: number; swimlane_id?: number; column_id?: number; category_id?: number; owner_id?: number }
    result: boolean
  }
  duplicateTaskToProject: {
    params: { task_id: number; project_id: number; swimlane_id?: number; column_id?: number; category_id?: number; owner_id?: number }
    result: number | boolean
  }
  createTask: { params: CreateTaskParams; result: number | boolean }
  updateTask: { params: UpdateTaskParams; result: boolean }
  searchTasks: { params: { project_id: number; query: string }; result: Task[] }

  // ProjectProcedure
  getProjectById: { params: { project_id: number }; result: Project | false }
  getProjectByName: { params: { name: string }; result: Project | false }
  getProjectByIdentifier: { params: { identifier: string }; result: Project | false }
  getProjectByEmail: { params: { email: string }; result: Project | false }
  getAllProjects: { params: Record<string, never>; result: Project[] }
  removeProject: { params: { project_id: number }; result: boolean }
  enableProject: { params: { project_id: number }; result: boolean }
  disableProject: { params: { project_id: number }; result: boolean }
  enableProjectPublicAccess: { params: { project_id: number }; result: boolean }
  disableProjectPublicAccess: { params: { project_id: number }; result: boolean }
  getProjectActivities: { params: { project_ids: number[] }; result: ProjectActivity[] }
  getProjectActivity: { params: { project_id: number }; result: ProjectActivity[] }
  createProject: { params: CreateProjectParams; result: number | boolean }
  updateProject: { params: UpdateProjectParams; result: boolean }

  // UserProcedure
  getUser: { params: { user_id: number }; result: User | false }
  getUserByName: { params: { username: string }; result: User | false }
  getAllUsers: { params: Record<string, never>; result: User[] }
  removeUser: { params: { user_id: number }; result: boolean }
  disableUser: { params: { user_id: number }; result: boolean }
  enableUser: { params: { user_id: number }; result: boolean }
  isActiveUser: { params: { user_id: number }; result: boolean }
  createUser: { params: CreateUserParams; result: number | boolean }
  createLdapUser: { params: { username: string }; result: number | boolean }
  updateUser: { params: UpdateUserParams; result: boolean }

  // MeProcedure (session user)
  getMe: { params: Record<string, never>; result: User }
  getMyProjects: { params: Record<string, never>; result: Project[] }
  getMyProjectsList: { params: Record<string, never>; result: Record<string, string> }
  getMyDashboard: { params: Record<string, never>; result: Task[] }
  getMyOverdueTasks: { params: Record<string, never>; result: OverdueTask[] }

  // AppProcedure
  getVersion: { params: Record<string, never>; result: string }
  getTimezone: { params: Record<string, never>; result: string }
  getDefaultTaskColor: { params: Record<string, never>; result: string }
  getDefaultTaskColors: { params: Record<string, never>; result: Record<string, TaskColor> }
  getColorList: { params: Record<string, never>; result: Record<string, string> }
  getApplicationRoles: { params: Record<string, never>; result: Record<string, string> }
  getProjectRoles: { params: Record<string, never>; result: Record<string, string> }
}

export type ApiMethodName = keyof ApiMethods
export type ApiParams<M extends ApiMethodName> = ApiMethods[M]['params']
export type ApiResult<M extends ApiMethodName> = ApiMethods[M]['result']

// ===========================================================================
// FEATURE STREAM SECTIONS: append below this line only. Do not edit above.
// ===========================================================================
