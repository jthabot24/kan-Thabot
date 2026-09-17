import { useState, type FormEvent } from 'react'
import { useCurrentUser } from '../../auth/AuthContext'
import type { CreateTaskParams, Task, TaskTags, UpdateTaskParams, ValidationErrors } from '../../api/types'
import * as api from '../../api/procedures'
import { Alert, FieldErrors, SubmitButtons, errorMessage } from '../../components/ui'
import { inputValueToServerDate, timestampToInputValue, toNumber } from './format'
import type { ProjectContext } from './hooks'
import { SERVER_REJECTED, hasErrors, validateTaskCreation, validateTaskModification } from './validation'
import { ColorPicker } from './ColorPicker'
import { TagsInput } from './TagsInput'

export interface TaskFormValues {
  title: string
  description: string
  tags: string[]
  color_id: string
  owner_id: string
  category_id: string
  swimlane_id: string
  column_id: string
  priority: string
  date_due: string
  date_started: string
  time_estimated: string
  time_spent: string
  score: string
  reference: string
}

export function initialValues(context: ProjectContext, task?: Task, tags?: TaskTags): TaskFormValues {
  const project = context.project
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    tags: tags ? Object.values(tags) : [],
    color_id: task?.color_id ?? '',
    owner_id: task ? String(task.owner_id) : '0',
    category_id: task ? String(task.category_id) : '0',
    swimlane_id: task ? String(task.swimlane_id) : String(context.swimlanes[0]?.id ?? ''),
    column_id: task ? String(task.column_id) : String(context.columns[0]?.id ?? ''),
    priority: task ? String(task.priority) : String(project.priority_default ?? 0),
    date_due: task ? timestampToInputValue(task.date_due) : '',
    date_started: task ? timestampToInputValue(task.date_started) : '',
    time_estimated: task && toNumber(task.time_estimated) ? String(task.time_estimated) : '',
    time_spent: task && toNumber(task.time_spent) ? String(task.time_spent) : '',
    score: task && toNumber(task.score) ? String(task.score) : '',
    reference: task?.reference ?? '',
  }
}

function priorityRange(context: ProjectContext): number[] {
  const start = toNumber(context.project.priority_start)
  const end = toNumber(context.project.priority_end)
  const list: number[] = []
  for (let i = Math.min(start, end); i <= Math.max(start, end); i++) list.push(i)
  return list
}

interface Props {
  context: ProjectContext
  task?: Task
  tags?: TaskTags
  onSaved: (taskId: number, options: { createAnother: boolean; duplicateMultiple: boolean }) => void
  onCancel: () => void
}

export function TaskForm({ context, task, tags, onSaved, onCancel }: Props) {
  const me = useCurrentUser()
  const isEdit = task !== undefined
  const [values, setValues] = useState<TaskFormValues>(() => initialValues(context, task, tags))
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createAnother, setCreateAnother] = useState(false)
  const [duplicateMultiple, setDuplicateMultiple] = useState(false)

  const set = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const numOrUndefined = (value: string) => (value.trim() === '' ? undefined : Number(value))

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setGlobalError(null)

    const serverDates = {
      date_due: inputValueToServerDate(values.date_due),
      date_started: inputValueToServerDate(values.date_started),
    }
    const toValidate = {
      ...values,
      ...serverDates,
      id: task?.id,
      project_id: context.project.id,
    }
    const localErrors = isEdit ? validateTaskModification(toValidate) : validateTaskCreation(toValidate)
    setErrors(localErrors)
    if (hasErrors(localErrors)) return

    setSubmitting(true)
    try {
      if (isEdit) {
        const params: UpdateTaskParams = {
          id: task.id,
          title: values.title,
          color_id: values.color_id,
          owner_id: Number(values.owner_id),
          date_due: serverDates.date_due,
          description: values.description,
          category_id: Number(values.category_id),
          score: numOrUndefined(values.score) ?? 0,
          priority: Number(values.priority),
          reference: values.reference,
          tags: values.tags,
          date_started: serverDates.date_started,
          time_spent: numOrUndefined(values.time_spent) ?? 0,
          time_estimated: numOrUndefined(values.time_estimated) ?? 0,
        }
        const ok = await api.updateTask(params)
        if (!ok) {
          setGlobalError(SERVER_REJECTED)
          return
        }
        onSaved(toNumber(task.id), { createAnother: false, duplicateMultiple: false })
      } else {
        const params: CreateTaskParams = {
          title: values.title,
          project_id: context.project.id,
          color_id: values.color_id,
          column_id: Number(values.column_id),
          owner_id: Number(values.owner_id),
          creator_id: me.id,
          date_due: serverDates.date_due,
          description: values.description,
          category_id: Number(values.category_id),
          score: numOrUndefined(values.score) ?? 0,
          swimlane_id: Number(values.swimlane_id),
          priority: Number(values.priority),
          reference: values.reference,
          tags: values.tags,
          date_started: serverDates.date_started,
          time_spent: numOrUndefined(values.time_spent) ?? null,
          time_estimated: numOrUndefined(values.time_estimated) ?? null,
        }
        const id = await api.createTask(params)
        if (id === false) {
          setGlobalError(SERVER_REJECTED)
          return
        }
        onSaved(toNumber(id), { createAnother, duplicateMultiple })
        if (createAnother) {
          setValues((v) => ({ ...initialValues(context), owner_id: v.owner_id, column_id: v.column_id, swimlane_id: v.swimlane_id, color_id: v.color_id, category_id: v.category_id }))
        }
      }
    } catch (e: unknown) {
      setGlobalError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  const userOptions = Object.entries(context.users)
  const meInProject = userOptions.some(([id]) => id === String(me.id))

  return (
    <form className="task-form" onSubmit={onSubmit} autoComplete="off">
      {globalError && <Alert>{globalError}</Alert>}

      <div className="form-columns">
        <div className="form-column form-column-main">
          <label htmlFor="form-title">
            Title <span className="required">*</span>
          </label>
          <input
            id="form-title"
            type="text"
            required
            autoFocus
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
          />
          <FieldErrors errors={errors} field="title" />

          <label htmlFor="form-description">Description</label>
          <textarea
            id="form-description"
            rows={8}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Write your text in Markdown"
          />
          <FieldErrors errors={errors} field="description" />

          <label>Tags</label>
          <TagsInput value={values.tags} suggestions={context.tags.map((t) => t.name)} onChange={(v) => set('tags', v)} />

          {!isEdit && (
            <>
              <label className="checkbox">
                <input type="checkbox" checked={createAnother} onChange={(e) => setCreateAnother(e.target.checked)} />{' '}
                Create another task
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={duplicateMultiple}
                  onChange={(e) => setDuplicateMultiple(e.target.checked)}
                />{' '}
                Duplicate to multiple projects
              </label>
            </>
          )}
        </div>

        <div className="form-column form-column-side">
          <label htmlFor="form-color">Color</label>
          <ColorPicker id="form-color" colors={context.colors} value={values.color_id} onChange={(v) => set('color_id', v)} />

          <label htmlFor="form-owner">
            Assignee
            {meInProject && (
              <>
                {' '}
                <button type="button" className="btn-link assign-me" onClick={() => set('owner_id', String(me.id))}>
                  Assign to me
                </button>
              </>
            )}
          </label>
          <select id="form-owner" value={values.owner_id} onChange={(e) => set('owner_id', e.target.value)}>
            {userOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <FieldErrors errors={errors} field="owner_id" />

          <label htmlFor="form-category">Category</label>
          <select id="form-category" value={values.category_id} onChange={(e) => set('category_id', e.target.value)}>
            <option value="0">No category</option>
            {context.categories.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldErrors errors={errors} field="category_id" />

          {!isEdit && (
            <>
              <label htmlFor="form-swimlane">Swimlane</label>
              <select id="form-swimlane" value={values.swimlane_id} onChange={(e) => set('swimlane_id', e.target.value)}>
                {context.swimlanes.map((s) => (
                  <option key={String(s.id)} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>
              <FieldErrors errors={errors} field="swimlane_id" />

              <label htmlFor="form-column">Column</label>
              <select id="form-column" value={values.column_id} onChange={(e) => set('column_id', e.target.value)}>
                {context.columns.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.title}
                  </option>
                ))}
              </select>
              <FieldErrors errors={errors} field="column_id" />
            </>
          )}

          <label htmlFor="form-priority">Priority</label>
          <select id="form-priority" value={values.priority} onChange={(e) => set('priority', e.target.value)}>
            {priorityRange(context).map((p) => (
              <option key={p} value={String(p)}>
                {p}
              </option>
            ))}
          </select>
          <FieldErrors errors={errors} field="priority" />

          <label htmlFor="form-date-due">Due Date</label>
          <input
            id="form-date-due"
            type="datetime-local"
            value={values.date_due}
            onChange={(e) => set('date_due', e.target.value)}
          />
          <FieldErrors errors={errors} field="date_due" />

          <label htmlFor="form-date-started">Start Date</label>
          <input
            id="form-date-started"
            type="datetime-local"
            value={values.date_started}
            onChange={(e) => set('date_started', e.target.value)}
          />
          <FieldErrors errors={errors} field="date_started" />

          <label htmlFor="form-time-estimated">Original estimate</label>
          <input
            id="form-time-estimated"
            type="number"
            step="0.25"
            min="0"
            placeholder="hours"
            value={values.time_estimated}
            onChange={(e) => set('time_estimated', e.target.value)}
          />
          <FieldErrors errors={errors} field="time_estimated" />

          <label htmlFor="form-time-spent">Time spent</label>
          <input
            id="form-time-spent"
            type="number"
            step="0.25"
            min="0"
            placeholder="hours"
            value={values.time_spent}
            onChange={(e) => set('time_spent', e.target.value)}
          />
          <FieldErrors errors={errors} field="time_spent" />

          <label htmlFor="form-score">Complexity</label>
          <input id="form-score" type="number" value={values.score} onChange={(e) => set('score', e.target.value)} />
          <FieldErrors errors={errors} field="score" />

          <label htmlFor="form-reference">Reference</label>
          <input
            id="form-reference"
            type="text"
            maxLength={191}
            value={values.reference}
            onChange={(e) => set('reference', e.target.value)}
          />
          <FieldErrors errors={errors} field="reference" />
        </div>
      </div>

      <SubmitButtons submitting={submitting} onCancel={onCancel} label={isEdit ? 'Save' : 'Save'} />
    </form>
  )
}
