// Additive-only: feature streams append new entries; never edit existing ones.
// PicoDb columns are strings unless a formatter explicitly casts them.

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  method: string
  id: number
  params?: unknown
}

export interface JsonRpcErrorObject {
  code: number
  message: string
  data?: unknown
}

export interface JsonRpcSuccess<T> {
  jsonrpc: '2.0'
  result: T
  id: number | string | null
}

export interface JsonRpcFailure {
  jsonrpc: '2.0'
  error: JsonRpcErrorObject
  id: number | string | null
}

export type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcFailure

export interface Task {
  id: string
  project_id: string
  owner_id: string
  creator_id: string
  date_due: string | null
  date_started: string | null
  date_completed: string | null
  status_id: string
  title: string
  description: string
  date_creation: string
  color_id: string
  category_id: string
  column_id: string
  swimlane_id: string
  position: string
  score: string
  reference: string
  time_spent: string
  time_estimated: string
  recurrence_status: string
  recurrence_trigger: string
  recurrence_factor: string
  recurrence_timeframe: string
  recurrence_basedate: string
  url: string
  color: Record<string, unknown>
  [key: string]: unknown
}

export interface ProjectUrl {
  board: string
  list: string
  calendar?: string
  public_board?: string
  rss_feed?: string
  ical_feed?: string
}

export interface Project {
  id: string
  name: string
  is_active: string
  is_private: string
  token: string
  last_modified: string
  is_public: string
  identifier: string
  url: ProjectUrl
  [key: string]: unknown
}

export type ProjectListItem = Record<string, string>

export interface User {
  id: number
  username: string
  name: string
  email: string
  role: string
  is_ldap_user?: boolean
  twofactor_activated?: boolean
  [key: string]: unknown
}

export type Me = User

export interface Column {
  id: string
  project_id: string
  title: string
  position: string
  task_limit: string
  description: string
  [key: string]: unknown
}

export interface Swimlane {
  id: string
  project_id: string
  name: string
  description: string
  position: string
  status: string
  [key: string]: unknown
}

export interface Category {
  id: string
  project_id: string
  name: string
  description: string
  [key: string]: unknown
}

export interface Bootstrap {
  user: User
  csrf_token: string
  base_url: string
  app: {
    timezone: string
    js_date_format: string
    js_time_format: string
    language: string
  }
  flash: {
    success: string | null
    failure: string | null
  }
  links: {
    login: string
    logout: string
    legacy_dashboard: string
  }
}

export interface ApiMethods {
  getMe: { params?: never; result: Me }
  getMyProjectsList: { params?: never; result: ProjectListItem }
  getMyProjects: { params?: never; result: Project[] }
  getTask: { params: { task_id: string | number }; result: Task }
  getAllTasks: { params: { project_id: string | number; status_id?: string | number }; result: Task[] }
  getProjectById: { params: { project_id: string | number }; result: Project }
  getAllProjects: { params?: never; result: Project[] }
  getUser: { params: { user_id: string | number }; result: User }
  getAllUsers: { params?: never; result: User[] }
  getBoard: { params: { project_id: string | number }; result: Record<string, unknown> }
  getColumns: { params: { project_id: string | number }; result: Column[] }
  getActiveSwimlanes: { params: { project_id: string | number }; result: Swimlane[] }
}
