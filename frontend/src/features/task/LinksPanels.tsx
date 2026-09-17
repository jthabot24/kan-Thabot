import { useEffect, useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import * as api from '../../api/procedures'
import {
  TASK_STATUS_OPEN,
  type ExternalLinkDependencies,
  type ExternalLinkTypes,
  type Task,
  type TaskExternalLink,
  type TaskLink,
  type ValidationErrors,
} from '../../api/types'
import { Alert, ConfirmDialog, FieldErrors, Modal, SubmitButtons, errorMessage } from '../../components/ui'
import { displayName, formatDateTime, formatHours, toNumber } from './format'
import type { TaskDetail } from './hooks'
import {
  SERVER_REJECTED,
  hasErrors,
  validateExternalLinkCreation,
  validateExternalLinkModification,
  validateInternalLink,
} from './validation'

// ---------------------------------------------------------------------------
// Internal links (app/Template/task_internal_link/*)
// ---------------------------------------------------------------------------

type InternalDialog = { kind: 'create' } | { kind: 'edit'; link: TaskLink } | { kind: 'remove'; link: TaskLink } | null

export function InternalLinksPanel({ detail, onChanged }: { detail: TaskDetail; onChanged: () => void }) {
  const { task, internalLinks, linkLabels } = detail
  const [dialog, setDialog] = useState<InternalDialog>(null)
  const [error, setError] = useState<string | null>(null)

  const grouped = new Map<string, TaskLink[]>()
  for (const link of internalLinks) {
    const list = grouped.get(link.label) ?? []
    list.push(link)
    grouped.set(link.label, list)
  }

  async function remove(link: TaskLink) {
    setError(null)
    try {
      await api.removeTaskLink(link.id)
      setDialog(null)
      onChanged()
    } catch (e: unknown) {
      setError(errorMessage(e))
    }
  }

  return (
    <section className="task-panel" id="internal-links">
      <div className="panel-header">
        <h3>Internal links</h3>
        <button type="button" className="btn btn-small" onClick={() => setDialog({ kind: 'create' })}>
          Add internal link
        </button>
      </div>
      {error && <Alert>{error}</Alert>}

      {internalLinks.length === 0 ? (
        <p className="empty">There is no internal link for the moment.</p>
      ) : (
        <table className="links-table">
          <thead>
            <tr>
              <th className="column-30">Label</th>
              <th>Task</th>
              <th>Assignee</th>
              <th>Time tracking</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...grouped.entries()].map(([label, links]) =>
              links.map((link, index) => {
                const closed = toNumber(link.is_active) !== TASK_STATUS_OPEN
                return (
                  <tr key={String(link.id)}>
                    <td>{index === 0 && <strong>This task {label}</strong>}</td>
                    <td>
                      <RouterLink to={`/tasks/${String(link.task_id)}`} className={closed ? 'task-closed' : ''}>
                        #{String(link.task_id)} {link.title}
                      </RouterLink>
                      <br />
                      <small>
                        {link.project_name} › {link.column_title}
                        {closed && ' · closed'}
                      </small>
                    </td>
                    <td>{link.task_assignee_username ? displayName(link.task_assignee_name, link.task_assignee_username) : ''}</td>
                    <td>
                      {toNumber(link.task_time_spent) > 0 && `${formatHours(link.task_time_spent)} spent`}
                      {toNumber(link.task_time_spent) > 0 && toNumber(link.task_time_estimated) > 0 && ' / '}
                      {toNumber(link.task_time_estimated) > 0 && `${formatHours(link.task_time_estimated)} estimated`}
                    </td>
                    <td className="actions">
                      <button type="button" className="btn-link" onClick={() => setDialog({ kind: 'edit', link })}>
                        Edit
                      </button>{' '}
                      <button type="button" className="btn-link" onClick={() => setDialog({ kind: 'remove', link })}>
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              }),
            )}
          </tbody>
        </table>
      )}

      {(dialog?.kind === 'create' || dialog?.kind === 'edit') && (
        <Modal title={dialog.kind === 'create' ? 'Add a new link' : 'Edit link'} onClose={() => setDialog(null)}>
          <InternalLinkForm
            task={task}
            labels={linkLabels}
            existing={dialog.kind === 'edit' ? dialog.link : undefined}
            onSaved={() => {
              setDialog(null)
              onChanged()
            }}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}
      {dialog?.kind === 'remove' && (
        <ConfirmDialog
          title="Remove a link"
          message={
            <>
              Do you really want to remove this link with task <strong>#{String(dialog.link.task_id)} {dialog.link.title}</strong>?
            </>
          }
          onClose={() => setDialog(null)}
          onConfirm={() => remove(dialog.link)}
        />
      )}
    </section>
  )
}

function InternalLinkForm({
  task,
  labels,
  existing,
  onSaved,
  onCancel,
}: {
  task: Task
  labels: { id: string | number; label: string }[]
  existing?: TaskLink
  onSaved: () => void
  onCancel: () => void
}) {
  const initialLabel = existing ? labels.find((l) => l.label === existing.label) : labels[0]
  const [linkId, setLinkId] = useState(initialLabel ? String(initialLabel.id) : '')
  const [query, setQuery] = useState(existing ? `#${String(existing.task_id)} ${existing.title}` : '')
  const [oppositeTaskId, setOppositeTaskId] = useState<string>(existing ? String(existing.task_id) : '')
  const [results, setResults] = useState<Task[]>([])
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 1 || /^#\d+ /.test(trimmed)) {
      setResults([])
      return
    }
    const handle = setTimeout(() => {
      // Matches TaskAjaxController::autocomplete(): "#123" resolves an id, otherwise search by title.
      const idMatch = /^#?(\d+)$/.exec(trimmed)
      const search = idMatch ? api.getTask(idMatch[1]).then((t) => (t ? [t] : [])) : api.searchTasks(task.project_id, trimmed)
      search
        .then((tasks) => setResults(tasks.filter((t) => toNumber(t.id) !== toNumber(task.id)).slice(0, 10)))
        .catch(() => setResults([]))
    }, 250)
    return () => clearTimeout(handle)
  }, [query, task.id, task.project_id])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const values = { task_id: task.id, opposite_task_id: oppositeTaskId, link_id: linkId }
    const localErrors = validateInternalLink(values)
    if (oppositeTaskId && toNumber(oppositeTaskId) === toNumber(task.id)) {
      localErrors.opposite_task_id = ['A task cannot be linked to itself']
    }
    setErrors(localErrors)
    if (hasErrors(localErrors)) return

    setSubmitting(true)
    try {
      const result = existing
        ? await api.updateTaskLink(existing.id, task.id, oppositeTaskId, linkId)
        : await api.createTaskLink(task.id, oppositeTaskId, linkId)
      if (result === false) {
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
    <form onSubmit={onSubmit} autoComplete="off">
      {error && <Alert>{error}</Alert>}
      <label htmlFor="link-label">
        Label <span className="required">*</span>
      </label>
      <select id="link-label" value={linkId} onChange={(e) => setLinkId(e.target.value)}>
        {labels.map((l) => (
          <option key={String(l.id)} value={String(l.id)}>
            This task {l.label}
          </option>
        ))}
      </select>
      <FieldErrors errors={errors} field="link_id" />

      <label htmlFor="link-task">
        Task <span className="required">*</span>
      </label>
      <input
        id="link-task"
        type="text"
        autoFocus
        placeholder="Start to type task title or task id (#123)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOppositeTaskId('')
        }}
      />
      {results.length > 0 && (
        <ul className="autocomplete-results" role="listbox">
          {results.map((t) => (
            <li key={String(t.id)}>
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setOppositeTaskId(String(t.id))
                  setQuery(`#${String(t.id)} ${t.title}`)
                  setResults([])
                }}
              >
                #{String(t.id)} {t.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      <FieldErrors errors={errors} field="opposite_task_id" />

      <SubmitButtons submitting={submitting} onCancel={onCancel} />
    </form>
  )
}

// ---------------------------------------------------------------------------
// External links (app/Template/task_external_link/*)
// ---------------------------------------------------------------------------

type ExternalDialog =
  | { kind: 'create' }
  | { kind: 'edit'; link: TaskExternalLink }
  | { kind: 'remove'; link: TaskExternalLink }
  | null

export function ExternalLinksPanel({ detail, onChanged }: { detail: TaskDetail; onChanged: () => void }) {
  const { task, externalLinks } = detail
  const [dialog, setDialog] = useState<ExternalDialog>(null)
  const [error, setError] = useState<string | null>(null)

  async function remove(link: TaskExternalLink) {
    setError(null)
    try {
      await api.removeExternalTaskLink(task.id, link.id)
      setDialog(null)
      onChanged()
    } catch (e: unknown) {
      setError(errorMessage(e))
    }
  }

  return (
    <section className="task-panel" id="external-links">
      <div className="panel-header">
        <h3>External links</h3>
        <button type="button" className="btn btn-small" onClick={() => setDialog({ kind: 'create' })}>
          Add external link
        </button>
      </div>
      {error && <Alert>{error}</Alert>}

      {externalLinks.length === 0 ? (
        <p className="empty">There is no external link for the moment.</p>
      ) : (
        <table className="links-table">
          <thead>
            <tr>
              <th className="column-30">Title</th>
              <th>Dependency</th>
              <th>Type</th>
              <th>Creator</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {externalLinks.map((link) => (
              <tr key={String(link.id)}>
                <td>
                  <a href={link.url} target="_blank" rel="noreferrer noopener" title={link.url}>
                    {link.title}
                  </a>
                </td>
                <td>{link.dependency_label}</td>
                <td>{link.type}</td>
                <td>{link.creator_username ? displayName(link.creator_name, link.creator_username) : ''}</td>
                <td>{formatDateTime(link.date_creation)}</td>
                <td className="actions">
                  <button type="button" className="btn-link" onClick={() => setDialog({ kind: 'edit', link })}>
                    Edit
                  </button>{' '}
                  <button type="button" className="btn-link" onClick={() => setDialog({ kind: 'remove', link })}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(dialog?.kind === 'create' || dialog?.kind === 'edit') && (
        <Modal title={dialog.kind === 'create' ? 'Add a new external link' : 'Edit external link'} onClose={() => setDialog(null)}>
          <ExternalLinkForm
            task={task}
            existing={dialog.kind === 'edit' ? dialog.link : undefined}
            onSaved={() => {
              setDialog(null)
              onChanged()
            }}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}
      {dialog?.kind === 'remove' && (
        <ConfirmDialog
          title="Remove a link"
          message={
            <>
              Do you really want to remove this link: <strong>{dialog.link.title}</strong>?
            </>
          }
          onClose={() => setDialog(null)}
          onConfirm={() => remove(dialog.link)}
        />
      )}
    </section>
  )
}

function ExternalLinkForm({
  task,
  existing,
  onSaved,
  onCancel,
}: {
  task: Task
  existing?: TaskExternalLink
  onSaved: () => void
  onCancel: () => void
}) {
  const [types, setTypes] = useState<ExternalLinkTypes>({})
  const [dependencies, setDependencies] = useState<ExternalLinkDependencies>({})
  const [linkType, setLinkType] = useState(existing?.link_type ?? 'auto')
  const [url, setUrl] = useState(existing?.url ?? '')
  const [title, setTitle] = useState(existing?.title ?? '')
  const [dependency, setDependency] = useState(existing?.dependency ?? 'related')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.getExternalTaskLinkTypes().then(setTypes).catch((e: unknown) => setError(errorMessage(e)))
  }, [])

  useEffect(() => {
    const provider = linkType === 'auto' ? 'weblink' : linkType
    api
      .getExternalTaskLinkProviderDependencies(provider)
      .then((deps) => setDependencies(deps || { related: 'Related' }))
      .catch(() => setDependencies({ related: 'Related' }))
  }, [linkType])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const effectiveType = linkType === 'auto' ? 'weblink' : linkType
    const values = { id: existing?.id, task_id: task.id, url, title: title || url, link_type: effectiveType, dependency }
    const localErrors = existing ? validateExternalLinkModification(values) : validateExternalLinkCreation(values)
    setErrors(localErrors)
    if (hasErrors(localErrors)) return

    setSubmitting(true)
    try {
      const result = existing
        ? await api.updateExternalTaskLink({ task_id: task.id, link_id: existing.id, title, url, dependency })
        : await api.createExternalTaskLink({ task_id: task.id, url, dependency, type: linkType, title: title || undefined })
      if (result === false) {
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
    <form onSubmit={onSubmit} autoComplete="off">
      {error && <Alert>{error}</Alert>}

      {!existing && (
        <>
          <label htmlFor="ext-type">Type</label>
          <select id="ext-type" value={linkType} onChange={(e) => setLinkType(e.target.value)}>
            <option value="auto">Auto</option>
            {Object.entries(types).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldErrors errors={errors} field="link_type" />
        </>
      )}

      <label htmlFor="ext-url">
        URL <span className="required">*</span>
      </label>
      <input id="ext-url" type="url" required autoFocus value={url} onChange={(e) => setUrl(e.target.value)} />
      <FieldErrors errors={errors} field="url" />

      <label htmlFor="ext-title">Title</label>
      <input id="ext-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Defaults to the URL" />
      <FieldErrors errors={errors} field="title" />

      <label htmlFor="ext-dependency">
        Dependency <span className="required">*</span>
      </label>
      <select id="ext-dependency" value={dependency} onChange={(e) => setDependency(e.target.value)}>
        {Object.entries(dependencies).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <FieldErrors errors={errors} field="dependency" />

      <SubmitButtons submitting={submitting} onCancel={onCancel} />
    </form>
  )
}
