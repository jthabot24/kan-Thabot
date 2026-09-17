export type Numeric = number | string;

export interface Project {
  id: Numeric;
  name: string;
  is_public?: Numeric;
  task_limit?: Numeric;
  per_swimlane_task_limits?: Numeric;
  [key: string]: unknown;
}

export interface Column {
  id: Numeric;
  title: string;
  position?: Numeric;
  task_limit?: Numeric;
  description?: string;
  project_id: Numeric;
  [key: string]: unknown;
}

export interface Swimlane {
  id: Numeric;
  name: string;
  description?: string;
  project_id: Numeric;
  position?: Numeric;
  is_active?: Numeric;
  task_limit?: Numeric;
  [key: string]: unknown;
}

export interface Tag {
  id: Numeric;
  name: string;
  color_id?: Numeric;
}

export interface BoardTask {
  id: Numeric;
  reference?: string;
  title: string;
  description?: string;
  date_creation?: Numeric;
  date_modification?: Numeric;
  date_completed?: Numeric;
  date_started?: Numeric;
  date_due?: Numeric;
  color_id?: Numeric;
  project_id: Numeric;
  column_id: Numeric;
  swimlane_id: Numeric;
  owner_id?: Numeric;
  creator_id?: Numeric;
  position: Numeric;
  is_active?: Numeric;
  score?: Numeric;
  category_id?: Numeric;
  priority?: Numeric;
  date_moved?: Numeric;
  recurrence_status?: Numeric;
  recurrence_trigger?: Numeric;
  recurrence_factor?: Numeric;
  recurrence_timeframe?: Numeric;
  recurrence_basedate?: Numeric;
  recurrence_parent?: Numeric;
  recurrence_child?: Numeric;
  time_estimated?: Numeric;
  time_spent?: Numeric;
  nb_comments?: Numeric;
  nb_files?: Numeric;
  nb_subtasks?: Numeric;
  nb_completed_subtasks?: Numeric;
  nb_links?: Numeric;
  nb_external_links?: Numeric;
  is_milestone?: Numeric;
  assignee_username?: string;
  assignee_name?: string;
  assignee_email?: string;
  assignee_avatar_path?: string;
  category_name?: string;
  category_description?: string;
  category_color_id?: Numeric;
  column_name?: string;
  column_position?: Numeric;
  swimlane_name?: string;
  project_name?: string;
  tags?: Tag[];
  is_draggable?: boolean;
  [key: string]: unknown;
}

export interface BoardColumn extends Column {
  nb_open_tasks?: Numeric;
  tasks: BoardTask[];
  nb_tasks?: Numeric;
  score?: Numeric;
  column_nb_open_tasks?: Numeric;
  nb_visible_tasks_across_swimlane?: Numeric;
  nb_unfiltered_tasks_across_swimlane?: Numeric;
  cumulative_score_across_swimlane?: Numeric;
}

export interface BoardSwimlane extends Swimlane {
  columns: BoardColumn[];
  nb_swimlanes?: Numeric;
  nb_columns?: Numeric;
  nb_tasks?: Numeric;
  score?: Numeric;
}

export interface User {
  id?: Numeric;
  username?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}
