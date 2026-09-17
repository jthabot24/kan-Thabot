import { useState, type FormEvent } from 'react'
import * as api from '../../api/procedures'
import {
  SUBTASK_STATUS_DONE,
  SUBTASK_STATUS_INPROGRESS,
  SUBTASK_STATUS_TODO,
  type Subtask,
  type ValidationErrors,
} from '../../api/types'
import { useCurrentUser } from '../../auth/AuthContext'
import { Alert, ConfirmDialog, FieldErrors, Modal, SubmitButtons, errorMessage } from '../../components/ui'
import { SUBTASK_STATUS_LIST } from './constants'
import { displayName, formatDateTime, formatHours, toNumber } from './format'
import type { TaskDetail } from './hooks'
import { SERVER_REJECTED, hasErrors, validateSubtaskCreation, validateSubtaskModification } from './validation'

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit'; subtask: Subtask }
  | { kind: 'remove'; subtask: Subtask }
  | { kind: 'convert'; subtask: Subtask }
  | null

function nextStatus(status: number): number {
  // Mirrors SubtaskStatusModel::toggleStatus(): todo -> in progress -> done -> todo
  return (status + 1) % 3
}

export function SubtasksPanel({ detail, onChanged }: { detail: TaskDetail; onChanged: () => void }) {
  const me = useCurrentUser()
  const { task, subtasks, users } = detail
  const [dialog, setDialog] = useState<Dialog>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<number | null>(null)

  async function run(subtaskId: number, action: () => Promise<unknown>) {
    setError(null)
    setBusy(subtaskId)
    try {
      await action()
      onChanged()
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  function toggleStatus(subtask: Subtask) {
    const status = nextStatus(toNumber(subtask.status))
    return run(toNumber(subtask.id), async () => {
      // Parity with SubtaskStatusController::change(): starting a subtask starts the timer,
      // finishing it stops the timer.
      await api.updateSubtask({ id: subtask.id, task_id: task.id, status })
      if (status === SUBTASK_STATUS_INPROGRESS) {
        await api.setSubtaskStartTime(subtask.id, me.id)
      } else if (subtask.is_timer_started) {
        await api.setSubtaskEndTime(subtask.id, me.id)
      }
    })
  }

  function toggleTimer(subtask: Subtask) {
    return run(toNumber(subtask.id), () =>
      subtask.is_timer_started ? api.setSubtaskEndTime(subtask.id, me.id) : api.setSubtaskStartTime(subtask.id, me.id),
    )
  }

  function move(subtask: Subtask, direction: -1 | 1) {
    const position = toNumber(subtask.position) + direction
    if (position < 1 || position > subtasks.length) return
    return run(toNumber(subtask.id), () => api.updateSubtask({ id: subtask.id, task_id: task.id, position }))
  }

  const totalEstimated = subtasks.reduce((sum, s) => sum + toNumber(s.time_estimated), 0)
  const totalSpent = subtasks.reduce((sum, s) => sum + toNumber(s.time_spent), 0)

  return (
    <section className="task-panel" id="subtasks">
      <div className="panel-header">
        <h3>Subtasks</h3>
        <button type="button" className="btn btn-small" onClick={() => setDialog({ kind: 'create' })}>
          Add a sub-task
        </button>
      </div>
      {error && <Alert>{error}</Alert>}

      {subtasks.length === 0 ? (
        <p className="empty">There is no sub-task at the moment.</p>
      ) : (
        <table className="subtasks-table">
          <thead>
            <tr>
              <th className="column-40">Title</th>
              <th>Assignee</th>
              <th>Time tracking</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subtasks.map((subtask) => {
              const status = toNumber(subtask.status)
              const isBusy = busy === toNumber(subtask.id)
              return (
                <tr key={String(subtask.id)} className={status === SUBTASK_STATUS_DONE ? 'subtask-done' : ''}>
                  <td>
                    <button
                      type="button"
                      className="btn-link subtask-toggle-status"
                      title="Change status"
                      disabled={isBusy}
                      onClick={() => toggleStatus(subtask)}
                    >
                      <span className={`subtask-status subtask-status-${status}`}>
                        {status === SUBTASK_STATUS_TODO && '☐'}
                        {status === SUBTASK_STATUS_INPROGRESS && '◐'}
                        {status === SUBTASK_STATUS_DONE && '☑'}
                      </span>{' '}
                      {subtask.title}
                    </button>
                    <span className="subtask-status-name"> ({SUBTASK_STATUS_LIST[status]})</span>
                  </td>
                  <td>{subtask.username ? displayName(subtask.name, subtask.username) : ''}</td>
                  <td>
                    {toNumber(subtask.time_spent) > 0 && <span>{formatHours(subtask.time_spent)} spent</span>}
                    {toNumber(subtask.time_spent) > 0 && toNumber(subtask.time_estimated) > 0 && ' / '}
                    {toNumber(subtask.time_estimated) > 0 && <span>{formatHours(subtask.time_estimated)} estimated</span>}
                    {status !== SUBTASK_STATUS_DONE && (
                      <>
                        {' '}
                        <button
                          type="button"
                          className="btn-link subtask-timer"
                          disabled={isBusy}
                          onClick={() => toggleTimer(subtask)}
                        >
                          {subtask.is_timer_started ? 'Stop timer' : 'Start timer'}
                        </button>
                        {subtask.is_timer_started && toNumber(subtask.timer_start_date) > 0 && (
                          <small className="timer-since"> (since {formatDateTime(subtask.timer_start_date)})</small>
                        )}
                      </>
                    )}
                  </td>
                  <td className="actions">
                    <button type="button" className="btn-link" disabled={isBusy || toNumber(subtask.position) <= 1} onClick={() => move(subtask, -1)} title="Move up">
                      ↑
                    </button>{' '}
                    <button type="button" className="btn-link" disabled={isBusy || toNumber(subtask.position) >= subtasks.length} onClick={() => move(subtask, 1)} title="Move down">
                      ↓
                    </button>{' '}
                    <button type="button" className="btn-link" onClick={() => setDialog({ kind: 'edit', subtask })}>
                      Edit
                    </button>{' '}
                    <button type="button" className="btn-link" onClick={() => setDialog({ kind: 'convert', subtask })}>
                      Convert to task
                    </button>{' '}
                    <button type="button" className="btn-link" onClick={() => setDialog({ kind: 'remove', subtask })}>
                      Remove
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          {(totalEstimated > 0 || totalSpent > 0) && (
            <tfoot>
              <tr>
                <td colSpan={2}>Total</td>
                <td colSpan={2}>
                  {totalSpent > 0 && `${formatHours(totalSpent)} spent`}
                  {totalSpent > 0 && totalEstimated > 0 && ' / '}
                  {totalEstimated > 0 && `${formatHours(totalEstimated)} estimated`}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      )}

      {dialog?.kind === 'create' && (
        <Modal title="Add a sub-task" onClose={() => setDialog(null)}>
          <SubtaskForm
            taskId={toNumber(task.id)}
            users={users}
            onSaved={() => {
              onChanged()
            }}
            onDone={() => setDialog(null)}
          />
        </Modal>
      )}
      {dialog?.kind === 'edit' && (
        <Modal title="Edit a sub-task" onClose={() => setDialog(null)}>
          <SubtaskForm
            taskId={toNumber(task.id)}
            users={users}
            subtask={dialog.subtask}
            onSaved={() => {
              onChanged()
              setDialog(null)
            }}
            onDone={() => setDialog(null)}
          />
        </Modal>
      )}
      {dialog?.kind === 'remove' && (
        <ConfirmDialog
          title="Remove a sub-task"
          message={
            <>
              Do you really want to remove this sub-task? <strong>{dialog.subtask.title}</strong>
            </>
          }
          onClose={() => setDialog(null)}
          onConfirm={() =>
            run(toNumber(dialog.subtask.id), () => api.removeSubtask(dialog.subtask.id)).then(() => setDialog(null))
          }
        />
      )}
      {dialog?.kind === 'convert' && (
        <ConfirmDialog
          title="Convert sub-task to task"
          message={
            <>
              Do you really want to convert this sub-task to a task? <strong>{dialog.subtask.title}</strong>
            </>
          }
          onClose={() => setDialog(null)}
          onConfirm={() =>
            run(toNumber(dialog.subtask.id), async () => {
              // Parity with SubtaskConverterModel::convertToTask()
              const id = await api.createTask({
                title: dialog.subtask.title,
                project_id: task.project_id,
                owner_id: toNumber(dialog.subtask.user_id),
                creator_id: me.id,
                column_id: task.column_id,
                swimlane_id: task.swimlane_id,
                time_estimated: dialog.subtask.time_estimated,
                time_spent: dialog.subtask.time_spent,
              })
              if (id === false) throw new Error(SERVER_REJECTED)
              await api.removeSubtask(dialog.subtask.id)
            }).then(() => setDialog(null))
          }
        />
      )}
    </section>
  )
}

// Port of app/Template/subtask/create.php and edit.php
function SubtaskForm({
  taskId,
  users,
  subtask,
  onSaved,
  onDone,
}: {
  taskId: number
  users: Record<string, string>
  subtask?: Subtask
  onSaved: () => void
  onDone: () => void
}) {
  const [title, setTitle] = useState(subtask?.title ?? '')
  const [userId, setUserId] = useState(subtask ? String(subtask.user_id) : '0')
  const [status, setStatus] = useState(subtask ? String(subtask.status) : String(SUBTASK_STATUS_TODO))
  const [timeEstimated, setTimeEstimated] = useState(subtask && toNumber(subtask.time_estimated) ? String(subtask.time_estimated) : '')
  const [timeSpent, setTimeSpent] = useState(subtask && toNumber(subtask.time_spent) ? String(subtask.time_spent) : '')
  const [anotherSubtask, setAnotherSubtask] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    // Creation supports several titles at once (one per line), like SubtaskController::save().
    const titles = subtask ? [title] : title.split('\n').map((t) => t.trim()).filter(Boolean)
    const base = { task_id: taskId, user_id: userId, time_estimated: timeEstimated, time_spent: timeSpent, status }

    const localErrors = subtask
      ? validateSubtaskModification({ ...base, id: subtask.id, title })
      : validateSubtaskCreation({ ...base, title: titles[0] ?? '' })
    setErrors(localErrors)
    if (hasErrors(localErrors)) return

    setSubmitting(true)
    try {
      if (subtask) {
        const ok = await api.updateSubtask({
          id: subtask.id,
          task_id: taskId,
          title,
          user_id: Number(userId),
          status: Number(status),
          time_estimated: timeEstimated === '' ? 0 : Number(timeEstimated),
          time_spent: timeSpent === '' ? 0 : Number(timeSpent),
        })
        if (!ok) {
          setError(SERVER_REJECTED)
          return
        }
      } else {
        for (const t of titles) {
          const id = await api.createSubtask({
            task_id: taskId,
            title: t,
            user_id: Number(userId),
            time_estimated: timeEstimated === '' ? 0 : Number(timeEstimated),
          })
          if (id === false) {
            setError(SERVER_REJECTED)
            return
          }
        }
      }
      onSaved()
      if (!subtask && anotherSubtask) {
        setTitle('')
      } else {
        onDone()
      }
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <Alert>{error}</Alert>}
      <label htmlFor="subtask-title">
        Title <span className="required">*</span>
      </label>
      {subtask ? (
        <input id="subtask-title" type="text" required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
      ) : (
        <textarea
          id="subtask-title"
          rows={3}
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter one sub-task per line"
        />
      )}
      <FieldErrors errors={errors} field="title" />

      <label htmlFor="subtask-user">Assignee</label>
      <select id="subtask-user" value={userId} onChange={(e) => setUserId(e.target.value)}>
        {Object.entries(users).map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
      <FieldErrors errors={errors} field="user_id" />

      {subtask && (
        <>
          <label htmlFor="subtask-status">Status</label>
          <select id="subtask-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(SUBTASK_STATUS_LIST).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldErrors errors={errors} field="status" />
        </>
      )}

      <label htmlFor="subtask-estimated">Original estimate</label>
      <input
        id="subtask-estimated"
        type="number"
        min="0"
        step="0.25"
        placeholder="hours"
        value={timeEstimated}
        onChange={(e) => setTimeEstimated(e.target.value)}
      />
      <FieldErrors errors={errors} field="time_estimated" />

      {subtask && (
        <>
          <label htmlFor="subtask-spent">Time spent</label>
          <input
            id="subtask-spent"
            type="number"
            min="0"
            step="0.25"
            placeholder="hours"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
          />
          <FieldErrors errors={errors} field="time_spent" />
        </>
      )}

      {!subtask && (
        <label className="checkbox">
          <input type="checkbox" checked={anotherSubtask} onChange={(e) => setAnotherSubtask(e.target.checked)} /> Create
          another sub-task
        </label>
      )}

      <SubmitButtons submitting={submitting} onCancel={onDone} />
    </form>
  )
}
