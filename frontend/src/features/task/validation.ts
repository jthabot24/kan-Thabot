import type { ValidationErrors } from '../../api/types'

// Client-side mirror of the server-side validators (app/Validator/TaskValidator.php,
// SubtaskValidator.php, CommentValidator.php, ExternalLinkValidator.php). The PHP
// validators remain the source of truth: the JSON-RPC procedures run them and return
// `false` on failure without the error map, so we replicate the same rules and
// messages here to give the user field-level feedback before the request is sent.

export type FormValues = Record<string, unknown>

type Rule = (values: FormValues) => [field: string, message: string] | null

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : String(value)
}

export const required =
  (field: string, message: string): Rule =>
  (values) =>
    isEmpty(values[field]) ? [field, message] : null

export const integer =
  (field: string, message: string): Rule =>
  (values) => {
    const value = values[field]
    if (isEmpty(value)) return null
    return /^-?\d+$/.test(asString(value).trim()) ? null : [field, message]
  }

export const numeric =
  (field: string, message: string): Rule =>
  (values) => {
    const value = values[field]
    if (isEmpty(value)) return null
    return /^-?\d*\.?\d+$/.test(asString(value).trim()) ? null : [field, message]
  }

export const maxLength =
  (field: string, max: number): Rule =>
  (values) => {
    const value = values[field]
    if (isEmpty(value)) return null
    return asString(value).length <= max ? null : [field, `The maximum length is ${max} characters`]
  }

export const range =
  (field: string, min: number, max: number): Rule =>
  (values) => {
    const value = values[field]
    if (isEmpty(value)) return null
    const n = Number(value)
    return n >= min && n <= max ? null : [field, `This value must be in the range ${min} to ${max}`]
  }

export const greaterThan =
  (field: string, min: number): Rule =>
  (values) => {
    const value = values[field]
    if (isEmpty(value)) return null
    return Number(value) > min ? null : [field, `This value must be greater than ${min}`]
  }

// Formats accepted by DateParser::getParserFormats(): Y-m-d, Y-m-d H:i, Y_m_d, and the
// localized date formats. Inputs in this UI always produce `Y-m-d` or `Y-m-d H:i`.
const DATE_PATTERN = /^\d{4}[-_]\d{2}[-_]\d{2}(?: \d{2}:\d{2})?$/

export const date =
  (field: string, message = 'Invalid date'): Rule =>
  (values) => {
    const value = values[field]
    if (isEmpty(value)) return null
    const text = asString(value)
    if (!DATE_PATTERN.test(text)) return [field, message]
    return Number.isNaN(new Date(text.replace('_', '-').replace(' ', 'T')).getTime()) ? [field, message] : null
  }

export const url =
  (field: string, message: string): Rule =>
  (values) => {
    const value = values[field]
    if (isEmpty(value)) return null
    try {
      const parsed = new URL(asString(value))
      return parsed.protocol ? null : [field, message]
    } catch {
      return [field, message]
    }
  }

export const inArray =
  (field: string, allowed: readonly string[], message: string): Rule =>
  (values) => {
    const value = values[field]
    if (isEmpty(value)) return null
    return allowed.includes(asString(value)) ? null : [field, message]
  }

export function runRules(values: FormValues, rules: Rule[]): ValidationErrors {
  const errors: ValidationErrors = {}
  for (const rule of rules) {
    const result = rule(values)
    if (result) {
      const [field, message] = result
      errors[field] = [...(errors[field] ?? []), message]
    }
  }
  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

// --- TaskValidator ----------------------------------------------------------

const INT = 'This value must be an integer'

function taskCommonRules(): Rule[] {
  return [
    integer('id', INT),
    integer('project_id', INT),
    integer('column_id', INT),
    integer('owner_id', INT),
    integer('creator_id', INT),
    integer('score', INT),
    range('score', -2147483647, 2147483647),
    integer('category_id', INT),
    integer('swimlane_id', INT),
    greaterThan('swimlane_id', 0),
    integer('recurrence_child', INT),
    integer('recurrence_parent', INT),
    integer('recurrence_factor', INT),
    integer('recurrence_timeframe', INT),
    integer('recurrence_basedate', INT),
    integer('recurrence_trigger', INT),
    integer('recurrence_status', INT),
    integer('priority', INT),
    maxLength('title', 65535),
    maxLength('reference', 191),
    date('date_due'),
    date('date_started'),
    numeric('time_spent', 'This value must be numeric'),
    numeric('time_estimated', 'This value must be numeric'),
  ]
}

function validateStartAndDueDate(values: FormValues): ValidationErrors {
  const start = values.date_started
  const due = values.date_due
  if (!isEmpty(start) && !isEmpty(due)) {
    const startTs = new Date(asString(start).replace(' ', 'T')).getTime()
    const dueTs = new Date(asString(due).replace(' ', 'T')).getTime()
    if (startTs > dueTs) {
      return { date_started: ['The start date is greater than the end date'] }
    }
  }
  return {}
}

export function validateTaskCreation(values: FormValues): ValidationErrors {
  const errors = runRules(values, [
    required('project_id', 'The project is required'),
    required('title', 'The title is required'),
    ...taskCommonRules(),
  ])
  return hasErrors(errors) ? errors : validateStartAndDueDate(values)
}

export function validateTaskModification(values: FormValues): ValidationErrors {
  const errors = runRules(values, [
    required('id', 'The id is required'),
    required('title', 'The title is required'),
    ...taskCommonRules(),
  ])
  return hasErrors(errors) ? errors : validateStartAndDueDate(values)
}

export function validateTaskRecurrence(values: FormValues): ValidationErrors {
  return runRules(values, [required('id', 'The id is required'), ...taskCommonRules()])
}

// --- SubtaskValidator -------------------------------------------------------

function subtaskCommonRules(): Rule[] {
  return [
    integer('id', 'The subtask id must be an integer'),
    integer('task_id', 'The task id must be an integer'),
    maxLength('title', 65535),
    integer('user_id', 'The user id must be an integer'),
    integer('status', 'The status must be an integer'),
    numeric('time_estimated', 'The time must be a numeric value'),
    numeric('time_spent', 'The time must be a numeric value'),
  ]
}

export function validateSubtaskCreation(values: FormValues): ValidationErrors {
  return runRules(values, [
    required('task_id', 'The task id is required'),
    required('title', 'The title is required'),
    ...subtaskCommonRules(),
  ])
}

export function validateSubtaskModification(values: FormValues): ValidationErrors {
  return runRules(values, [
    required('id', 'The subtask id is required'),
    required('task_id', 'The task id is required'),
    required('title', 'The title is required'),
    ...subtaskCommonRules(),
  ])
}

// --- CommentValidator -------------------------------------------------------

const VISIBILITIES = ['app-user', 'app-manager', 'app-admin'] as const

function commentCommonRules(): Rule[] {
  return [
    integer('id', INT),
    integer('task_id', INT),
    integer('user_id', INT),
    maxLength('reference', 191),
    required('comment', 'Comment is required'),
  ]
}

export function validateCommentCreation(values: FormValues): ValidationErrors {
  return runRules(values, [
    required('task_id', 'This value is required'),
    required('visibility', 'Visibility is required'),
    inArray('visibility', VISIBILITIES, 'The visibility should be an app role'),
    ...commentCommonRules(),
  ])
}

export function validateCommentModification(values: FormValues): ValidationErrors {
  return runRules(values, [required('id', 'This value is required'), ...commentCommonRules()])
}

// --- ExternalLinkValidator --------------------------------------------------

function externalLinkCommonRules(): Rule[] {
  return [
    required('url', 'Field required'),
    maxLength('url', 65535),
    url('url', 'This URL is invalid'),
    required('title', 'Field required'),
    maxLength('title', 65535),
    required('link_type', 'Field required'),
    maxLength('link_type', 100),
    required('dependency', 'Field required'),
    maxLength('dependency', 100),
    integer('id', INT),
    required('task_id', 'Field required'),
    integer('task_id', INT),
  ]
}

export function validateExternalLinkCreation(values: FormValues): ValidationErrors {
  return runRules(values, externalLinkCommonRules())
}

export function validateExternalLinkModification(values: FormValues): ValidationErrors {
  return runRules(values, [required('id', 'The id is required'), ...externalLinkCommonRules()])
}

// --- Internal links (TaskInternalLinkController parity) ---------------------

export function validateInternalLink(values: FormValues): ValidationErrors {
  return runRules(values, [
    required('task_id', 'Field required'),
    required('opposite_task_id', 'Field required'),
    required('link_id', 'Field required'),
    integer('task_id', INT),
    integer('opposite_task_id', INT),
    integer('link_id', INT),
  ])
}

/** Error shown when the server rejected values (the API returns `false` without the error map). */
export const SERVER_REJECTED = 'The server rejected the submitted values. Please check the form and try again.'
