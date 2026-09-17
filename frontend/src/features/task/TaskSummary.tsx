import { Link } from 'react-router-dom'
import { TASK_STATUS_OPEN, RECURRING_STATUS_NONE } from '../../api/types'
import type { TaskDetail } from './hooks'
import { displayName, formatDateTime, formatHours, isTruthy, toNumber } from './format'
import {
  RECURRENCE_BASEDATE_LIST,
  RECURRENCE_STATUS_LIST,
  RECURRENCE_TIMEFRAME_LIST,
  RECURRENCE_TRIGGER_LIST,
} from './constants'

// Port of app/Template/task/details.php
export function TaskSummary({ detail }: { detail: TaskDetail }) {
  const { task, project, columns, swimlanes, categories, assignee, creator, tags } = detail
  const column = columns.find((c) => toNumber(c.id) === toNumber(task.column_id))
  const swimlane = swimlanes.find((s) => toNumber(s.id) === toNumber(task.swimlane_id))
  const category = categories.find((c) => toNumber(c.id) === toNumber(task.category_id))
  const isOpen = toNumber(task.is_active) === TASK_STATUS_OPEN

  return (
    <div className={`task-summary color-${task.color_id}`}>
      <h2>
        #{String(task.id)} {task.title}
        {task.reference && <span className="task-reference"> ({task.reference})</span>}
      </h2>

      <div className="task-summary-columns">
        <ul className="task-summary-column">
          <li>
            <strong>Status:</strong> {isOpen ? 'open' : 'closed'}
          </li>
          <li>
            <strong>Priority:</strong> {String(task.priority)}
          </li>
          {task.reference && (
            <li>
              <strong>Reference:</strong> {task.reference}
            </li>
          )}
          {toNumber(task.score) !== 0 && (
            <li>
              <strong>Complexity:</strong> {String(task.score)}
            </li>
          )}
          {category && (
            <li>
              <strong>Category:</strong> {category.name}
            </li>
          )}
          {swimlane && (
            <li>
              <strong>Swimlane:</strong> {swimlane.name}
            </li>
          )}
          <li>
            <strong>Column:</strong> {column?.title ?? `#${String(task.column_id)}`}
          </li>
          <li>
            <strong>Position:</strong> {String(task.position)}
          </li>
          <li>
            <strong>Assignee:</strong> {assignee ? displayName(assignee.name, assignee.username) : 'not assigned'}
          </li>
          {creator && (
            <li>
              <strong>Creator:</strong> {displayName(creator.name, creator.username)}
            </li>
          )}
          {toNumber(task.time_estimated) > 0 && (
            <li>
              <strong>Time estimated:</strong> {formatHours(task.time_estimated)}
            </li>
          )}
          {toNumber(task.time_spent) > 0 && (
            <li>
              <strong>Time spent:</strong> {formatHours(task.time_spent)}
            </li>
          )}
        </ul>

        <ul className="task-summary-column">
          {isTruthy(task.date_due) && (
            <li>
              <strong>Due date:</strong> {formatDateTime(task.date_due)}
            </li>
          )}
          {isTruthy(task.date_started) && (
            <li>
              <strong>Started:</strong> {formatDateTime(task.date_started)}
            </li>
          )}
          <li>
            <strong>Created:</strong> {formatDateTime(task.date_creation)}
          </li>
          <li>
            <strong>Modified:</strong> {formatDateTime(task.date_modification)}
          </li>
          {isTruthy(task.date_completed) && (
            <li>
              <strong>Completed:</strong> {formatDateTime(task.date_completed)}
            </li>
          )}
          {isTruthy(task.date_moved) && (
            <li>
              <strong>Moved:</strong> {formatDateTime(task.date_moved)}
            </li>
          )}
          <li>
            <strong>Project:</strong> {project.name}
          </li>
          {Object.keys(tags).length > 0 && (
            <li className="task-tags">
              <strong>Tags:</strong>{' '}
              {Object.entries(tags).map(([id, name]) => (
                <span key={id} className="tag">
                  {name}
                </span>
              ))}
            </li>
          )}
          {task.external_provider && (
            <li>
              <strong>External:</strong>{' '}
              {task.external_uri ? (
                <a href={task.external_uri} target="_blank" rel="noreferrer noopener">
                  {task.external_provider}
                </a>
              ) : (
                task.external_provider
              )}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

// Port of app/Template/task/time_tracking_summary.php
export function TimeTrackingSummary({ detail }: { detail: TaskDetail }) {
  const { task } = detail
  const estimated = toNumber(task.time_estimated)
  const spent = toNumber(task.time_spent)
  if (estimated === 0 && spent === 0) return null
  const remaining = estimated - spent
  return (
    <section className="task-panel">
      <h3>Time tracking</h3>
      <ul>
        <li>
          <strong>Estimate:</strong> {formatHours(estimated)}
        </li>
        <li>
          <strong>Spent:</strong> {formatHours(spent)}
        </li>
        <li>
          <strong>Remaining:</strong> {formatHours(remaining)}
        </li>
      </ul>
    </section>
  )
}

// Port of app/Template/task_recurrence/info.php
export function RecurrenceInfo({ detail }: { detail: TaskDetail }) {
  const { task } = detail
  if (toNumber(task.recurrence_status) === RECURRING_STATUS_NONE) return null
  return (
    <section className="task-panel">
      <h3>Recurrence</h3>
      <ul>
        <li>
          <strong>Status:</strong> {RECURRENCE_STATUS_LIST[toNumber(task.recurrence_status)]}
        </li>
        <li>
          <strong>Trigger:</strong> {RECURRENCE_TRIGGER_LIST[toNumber(task.recurrence_trigger)]}
        </li>
        <li>
          <strong>Factor:</strong> {String(task.recurrence_factor)} {RECURRENCE_TIMEFRAME_LIST[toNumber(task.recurrence_timeframe)]}
        </li>
        <li>
          <strong>Base date:</strong> {RECURRENCE_BASEDATE_LIST[toNumber(task.recurrence_basedate)]}
        </li>
        {isTruthy(task.recurrence_parent) && (
          <li>
            <strong>Parent task:</strong> <Link to={`/tasks/${String(task.recurrence_parent)}`}>#{String(task.recurrence_parent)}</Link>
          </li>
        )}
        {isTruthy(task.recurrence_child) && (
          <li>
            <strong>Child task:</strong> <Link to={`/tasks/${String(task.recurrence_child)}`}>#{String(task.recurrence_child)}</Link>
          </li>
        )}
      </ul>
    </section>
  )
}
