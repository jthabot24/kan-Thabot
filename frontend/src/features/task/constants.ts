import {
  RECURRING_BASEDATE_DUEDATE,
  RECURRING_BASEDATE_TRIGGERDATE,
  RECURRING_STATUS_NONE,
  RECURRING_STATUS_PENDING,
  RECURRING_STATUS_PROCESSED,
  RECURRING_TIMEFRAME_DAYS,
  RECURRING_TIMEFRAME_MONTHS,
  RECURRING_TIMEFRAME_YEARS,
  RECURRING_TRIGGER_CLOSE,
  RECURRING_TRIGGER_FIRST_COLUMN,
  RECURRING_TRIGGER_LAST_COLUMN,
  SUBTASK_STATUS_DONE,
  SUBTASK_STATUS_INPROGRESS,
  SUBTASK_STATUS_TODO,
  type CommentVisibility,
} from '../../api/types'

// Mirrors TaskModel::getRecurrence*List()
export const RECURRENCE_STATUS_LIST: Record<number, string> = {
  [RECURRING_STATUS_NONE]: 'No',
  [RECURRING_STATUS_PENDING]: 'Yes',
  [RECURRING_STATUS_PROCESSED]: 'Processed',
}

export const RECURRENCE_TRIGGER_LIST: Record<number, string> = {
  [RECURRING_TRIGGER_FIRST_COLUMN]: 'When task is moved from first column',
  [RECURRING_TRIGGER_LAST_COLUMN]: 'When task is moved to last column',
  [RECURRING_TRIGGER_CLOSE]: 'When task is closed',
}

export const RECURRENCE_TIMEFRAME_LIST: Record<number, string> = {
  [RECURRING_TIMEFRAME_DAYS]: 'Day(s)',
  [RECURRING_TIMEFRAME_MONTHS]: 'Month(s)',
  [RECURRING_TIMEFRAME_YEARS]: 'Year(s)',
}

export const RECURRENCE_BASEDATE_LIST: Record<number, string> = {
  [RECURRING_BASEDATE_DUEDATE]: 'Existing due date',
  [RECURRING_BASEDATE_TRIGGERDATE]: 'Action date',
}

// Mirrors SubtaskModel::getStatusList()
export const SUBTASK_STATUS_LIST: Record<number, string> = {
  [SUBTASK_STATUS_TODO]: 'Todo',
  [SUBTASK_STATUS_INPROGRESS]: 'In progress',
  [SUBTASK_STATUS_DONE]: 'Done',
}

export const COMMENT_VISIBILITY_LIST: Record<CommentVisibility, string> = {
  'app-user': 'Standard users',
  'app-manager': 'Application managers or more',
  'app-admin': 'Administrators',
}

export const APP_ROLE_ADMIN = 'app-admin'
export const APP_ROLE_MANAGER = 'app-manager'
export const APP_ROLE_USER = 'app-user'
