import { useEffect, useState, type FormEvent } from 'react'
import * as api from '../../api/procedures'
import {
  RECURRING_STATUS_NONE,
  RECURRING_STATUS_PENDING,
  TASK_STATUS_OPEN,
  type BoardTask,
  type Project,
  type Task,
  type ValidationErrors,
} from '../../api/types'
import { Alert, ConfirmDialog, FieldErrors, Modal, Spinner, SubmitButtons, errorMessage } from '../../components/ui'
import {
  RECURRENCE_BASEDATE_LIST,
  RECURRENCE_STATUS_LIST,
  RECURRENCE_TIMEFRAME_LIST,
  RECURRENCE_TRIGGER_LIST,
} from './constants'
import { toNumber } from './format'
import { type ProjectContext, loadProjectContext } from './hooks'
import { RecurrenceInfo } from './TaskSummary'
import type { TaskDetail } from './hooks'
import { SERVER_REJECTED, hasErrors, validateTaskRecurrence } from './validation'

function Options({ list }: { list: Record<number, string> }) {
  return (
    <>
      {Object.entries(list).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </>
  )
}

// Port of app/Template/task_recurrence/edit.php
export function RecurrenceDialog({ detail, onSaved, onClose }: { detail: TaskDetail; onSaved: () => void; onClose: () => void }) {
  const { task } = detail
  const editable = toNumber(task.recurrence_status) !== RECURRING_STATUS_NONE ? false : true
  const [values, setValues] = useState({
    recurrence_status: String(task.recurrence_status),
    recurrence_trigger: String(task.recurrence_trigger),
    recurrence_factor: String(task.recurrence_factor),
    recurrence_timeframe: String(task.recurrence_timeframe),
    recurrence_basedate: String(task.recurrence_basedate),
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = (key: keyof typeof values, value: string) => setValues((v) => ({ ...v, [key]: value }))

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const localErrors = validateTaskRecurrence({ id: task.id, ...values })
    setErrors(localErrors)
    if (hasErrors(localErrors)) return
    setSubmitting(true)
    try {
      const ok = await api.updateTask({
        id: task.id,
        recurrence_status: Number(values.recurrence_status),
        recurrence_trigger: Number(values.recurrence_trigger),
        recurrence_factor: Number(values.recurrence_factor),
        recurrence_timeframe: Number(values.recurrence_timeframe),
        recurrence_basedate: Number(values.recurrence_basedate),
      })
      if (!ok) {
        setError(SERVER_REJECTED)
        return
      }
      onSaved()
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Edit recurrence" onClose={onClose}>
      {!editable && <RecurrenceInfo detail={detail} />}
      {editable ? (
        <form onSubmit={onSubmit}>
          {error && <Alert>{error}</Alert>}
          <label htmlFor="rec-status">Generate recurrent task</label>
          <select id="rec-status" value={values.recurrence_status} onChange={(e) => set('recurrence_status', e.target.value)}>
            {[RECURRING_STATUS_NONE, RECURRING_STATUS_PENDING].map((s) => (
              <option key={s} value={String(s)}>
                {RECURRENCE_STATUS_LIST[s]}
              </option>
            ))}
          </select>
          <FieldErrors errors={errors} field="recurrence_status" />

          <label htmlFor="rec-trigger">Trigger to generate recurrent task</label>
          <select id="rec-trigger" value={values.recurrence_trigger} onChange={(e) => set('recurrence_trigger', e.target.value)}>
            <Options list={RECURRENCE_TRIGGER_LIST} />
          </select>
          <FieldErrors errors={errors} field="recurrence_trigger" />

          <label htmlFor="rec-factor">Factor to calculate new due date</label>
          <input id="rec-factor" type="number" value={values.recurrence_factor} onChange={(e) => set('recurrence_factor', e.target.value)} />
          <FieldErrors errors={errors} field="recurrence_factor" />

          <label htmlFor="rec-timeframe">Timeframe to calculate new due date</label>
          <select id="rec-timeframe" value={values.recurrence_timeframe} onChange={(e) => set('recurrence_timeframe', e.target.value)}>
            <Options list={RECURRENCE_TIMEFRAME_LIST} />
          </select>
          <FieldErrors errors={errors} field="recurrence_timeframe" />

          <label htmlFor="rec-basedate">Base date to calculate new due date</label>
          <select id="rec-basedate" value={values.recurrence_basedate} onChange={(e) => set('recurrence_basedate', e.target.value)}>
            <Options list={RECURRENCE_BASEDATE_LIST} />
          </select>
          <FieldErrors errors={errors} field="recurrence_basedate" />

          <SubmitButtons submitting={submitting} onCancel={onClose} />
        </form>
      ) : (
        <p className="form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </p>
      )}
    </Modal>
  )
}

// Port of app/Template/task_status/open.php and close.php
export function StatusDialog({ task, onDone, onClose }: { task: Task; onDone: () => void; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const isOpen = toNumber(task.is_active) === TASK_STATUS_OPEN

  async function confirm() {
    setError(null)
    try {
      const ok = isOpen ? await api.closeTask(task.id) : await api.openTask(task.id)
      if (!ok) throw new Error(SERVER_REJECTED)
      onDone()
    } catch (e: unknown) {
      setError(errorMessage(e))
    }
  }

  return (
    <ConfirmDialog
      title={isOpen ? 'Close a task' : 'Open a task'}
      message={
        <>
          Do you really want to {isOpen ? 'close' : 'open'} this task: <strong>{task.title}</strong>?
        </>
      }
      error={error}
      onConfirm={confirm}
      onClose={onClose}
    />
  )
}

// Port of app/Template/task_suppression/remove.php
export function RemoveDialog({ task, onDone, onClose }: { task: Task; onDone: () => void; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    setError(null)
    try {
      const ok = await api.removeTask(task.id)
      if (!ok) throw new Error(SERVER_REJECTED)
      onDone()
    } catch (e: unknown) {
      setError(errorMessage(e))
    }
  }

  return (
    <ConfirmDialog
      title="Remove a task"
      message={
        <>
          Do you really want to remove this task: <strong>{task.title}</strong>?
        </>
      }
      error={error}
      onConfirm={confirm}
      onClose={onClose}
    />
  )
}

// Port of app/Template/task_duplication/copy.php and move.php
export function ProjectTransferDialog({
  task,
  mode,
  onDone,
  onClose,
}: {
  task: Task
  mode: 'duplicate' | 'move'
  onDone: (newTaskId: number | null) => void
  onClose: () => void
}) {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [projectId, setProjectId] = useState(String(task.project_id))
  const [context, setContext] = useState<ProjectContext | null>(null)
  const [swimlaneId, setSwimlaneId] = useState('')
  const [columnId, setColumnId] = useState('')
  const [categoryId, setCategoryId] = useState('0')
  const [ownerId, setOwnerId] = useState('0')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.getMyProjects().then(setProjects).catch((e: unknown) => setError(errorMessage(e)))
  }, [])

  useEffect(() => {
    let cancelled = false
    setContext(null)
    loadProjectContext(projectId)
      .then((ctx) => {
        if (cancelled) return
        setContext(ctx)
        // Parity with TaskDuplicationController::chooseDestination(): keep the current values
        // when they exist in the destination project, otherwise use the first available.
        const sameProject = toNumber(projectId) === toNumber(task.project_id)
        setSwimlaneId(String(sameProject ? task.swimlane_id : (ctx.swimlanes[0]?.id ?? '')))
        setColumnId(String(sameProject ? task.column_id : (ctx.columns[0]?.id ?? '')))
        setCategoryId(sameProject ? String(task.category_id) : '0')
        setOwnerId(String(task.owner_id) in ctx.users ? String(task.owner_id) : '0')
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e))
      })
    return () => {
      cancelled = true
    }
  }, [projectId, task])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const params = {
        task_id: task.id,
        project_id: projectId,
        swimlane_id: Number(swimlaneId),
        column_id: Number(columnId),
        category_id: Number(categoryId),
        owner_id: Number(ownerId),
      }
      if (mode === 'move') {
        const ok = await api.moveTaskToProject(params)
        if (!ok) throw new Error(SERVER_REJECTED)
        onDone(null)
      } else {
        const id = await api.duplicateTaskToProject(params)
        if (id === false) throw new Error(SERVER_REJECTED)
        onDone(toNumber(id))
      }
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'move' ? 'Move the task to another project' : 'Duplicate the task to another project'

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        {projects === null ? (
          <Spinner />
        ) : (
          <>
            <label htmlFor="transfer-project">Project</label>
            <select id="transfer-project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={String(p.id)} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>

            {context === null ? (
              <Spinner />
            ) : (
              <>
                <label htmlFor="transfer-swimlane">Swimlane</label>
                <select id="transfer-swimlane" value={swimlaneId} onChange={(e) => setSwimlaneId(e.target.value)}>
                  {context.swimlanes.map((s) => (
                    <option key={String(s.id)} value={String(s.id)}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <label htmlFor="transfer-column">Column</label>
                <select id="transfer-column" value={columnId} onChange={(e) => setColumnId(e.target.value)}>
                  {context.columns.map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>
                      {c.title}
                    </option>
                  ))}
                </select>

                <label htmlFor="transfer-category">Category</label>
                <select id="transfer-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="0">No category</option>
                  {context.categories.map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <label htmlFor="transfer-owner">Assignee</label>
                <select id="transfer-owner" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                  {Object.entries(context.users).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </>
        )}
        <SubmitButtons submitting={submitting || context === null} onCancel={onClose} label={mode === 'move' ? 'Move' : 'Duplicate'} />
      </form>
    </Modal>
  )
}

// Port of app/Template/task_move_position/show.php
export function MovePositionDialog({ detail, onDone, onClose }: { detail: TaskDetail; onDone: () => void; onClose: () => void }) {
  const { task, columns, swimlanes } = detail
  const [swimlaneId, setSwimlaneId] = useState(String(task.swimlane_id))
  const [columnId, setColumnId] = useState(String(task.column_id))
  const [referenceTaskId, setReferenceTaskId] = useState('')
  const [direction, setDirection] = useState<'before' | 'after'>('before')
  const [tasksInCell, setTasksInCell] = useState<BoardTask[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setTasksInCell(null)
    api
      .getBoard(task.project_id)
      .then((board) => {
        if (cancelled) return
        const swimlane = board.find((s) => toNumber(s.id) === toNumber(swimlaneId))
        const column = swimlane?.columns.find((c) => toNumber(c.id) === toNumber(columnId))
        const list = (column?.tasks ?? []).filter((t) => toNumber(t.id) !== toNumber(task.id))
        setTasksInCell(list)
        setReferenceTaskId(list[0] ? String(list[0].id) : '')
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e))
      })
    return () => {
      cancelled = true
    }
  }, [task.project_id, task.id, swimlaneId, columnId])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // Same computation as TaskMovePositionController::save()
      let position = 1
      if (tasksInCell && referenceTaskId) {
        const reference = tasksInCell.find((t) => toNumber(t.id) === toNumber(referenceTaskId))
        if (reference) {
          position = toNumber(reference.position)
          if (direction === 'after') position += 1
          if (toNumber(task.column_id) === toNumber(columnId) && toNumber(task.swimlane_id) === toNumber(swimlaneId) && toNumber(task.position) < position) {
            position -= 1
          }
        }
      }
      const ok = await api.moveTaskPosition({
        project_id: task.project_id,
        task_id: task.id,
        column_id: Number(columnId),
        swimlane_id: Number(swimlaneId),
        position: Math.max(1, position),
      })
      if (!ok) throw new Error(SERVER_REJECTED)
      onDone()
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Move task to another position on the board" onClose={onClose}>
      <form onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <label htmlFor="pos-swimlane">Swimlane</label>
        <select id="pos-swimlane" value={swimlaneId} onChange={(e) => setSwimlaneId(e.target.value)}>
          {swimlanes.map((s) => (
            <option key={String(s.id)} value={String(s.id)}>
              {s.name}
            </option>
          ))}
        </select>

        <label htmlFor="pos-column">Column</label>
        <select id="pos-column" value={columnId} onChange={(e) => setColumnId(e.target.value)}>
          {columns.map((c) => (
            <option key={String(c.id)} value={String(c.id)}>
              {c.title}
            </option>
          ))}
        </select>

        {tasksInCell === null ? (
          <Spinner />
        ) : tasksInCell.length === 0 ? (
          <p className="alert alert-info">This column is empty; the task will be placed first.</p>
        ) : (
          <>
            <label htmlFor="pos-direction">Position</label>
            <select id="pos-direction" value={direction} onChange={(e) => setDirection(e.target.value as 'before' | 'after')}>
              <option value="before">Insert before this task</option>
              <option value="after">Insert after this task</option>
            </select>
            <label htmlFor="pos-task">Task</label>
            <select id="pos-task" value={referenceTaskId} onChange={(e) => setReferenceTaskId(e.target.value)}>
              {tasksInCell.map((t) => (
                <option key={String(t.id)} value={String(t.id)}>
                  #{String(t.id)} {t.title}
                </option>
              ))}
            </select>
          </>
        )}

        <SubmitButtons submitting={submitting || tasksInCell === null} onCancel={onClose} label="Move" />
      </form>
    </Modal>
  )
}
