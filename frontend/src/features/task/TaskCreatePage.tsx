import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../../api/procedures'
import type { Project } from '../../api/types'
import { Alert, Modal, Spinner, SubmitButtons, errorMessage } from '../../components/ui'
import { toNumber } from './format'
import { useProjectContext } from './hooks'
import { TaskForm } from './TaskForm'
import { SERVER_REJECTED } from './validation'

// Port of app/Template/task_creation/show.php (+ duplicate_projects.php)
export function TaskCreatePage() {
  const params = useParams<{ projectId: string }>()
  const projectId = params.projectId ?? ''
  const navigate = useNavigate()
  const { context, error } = useProjectContext(projectId)
  const [notice, setNotice] = useState<string | null>(null)
  const [duplicateFrom, setDuplicateFrom] = useState<number | null>(null)

  if (error) return <Alert>{error}</Alert>
  if (!context) return <Spinner />

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/">Projects</Link> › {context.project.name} › New task
      </nav>
      <h2>Create a new task</h2>
      {notice && <Alert kind="success">{notice}</Alert>}
      <TaskForm
        context={context}
        onCancel={() => navigate('/')}
        onSaved={(taskId, { createAnother, duplicateMultiple }) => {
          if (duplicateMultiple) {
            setDuplicateFrom(taskId)
          } else if (createAnother) {
            setNotice(
              `Task #${taskId} created successfully.`,
            )
          } else {
            navigate(`/tasks/${taskId}`)
          }
        }}
      />
      {duplicateFrom !== null && (
        <DuplicateToProjectsDialog
          taskId={duplicateFrom}
          currentProjectId={toNumber(projectId)}
          onClose={() => navigate(`/tasks/${duplicateFrom}`)}
        />
      )}
    </div>
  )
}

function DuplicateToProjectsDialog({
  taskId,
  currentProjectId,
  onClose,
}: {
  taskId: number
  currentProjectId: number
  onClose: () => void
}) {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .getMyProjects()
      .then((list) => setProjects(list.filter((p) => toNumber(p.id) !== currentProjectId)))
      .catch((e: unknown) => setError(errorMessage(e)))
  }, [currentProjectId])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      for (const projectId of selected) {
        const id = await api.duplicateTaskToProject({ task_id: taskId, project_id: projectId })
        if (id === false) throw new Error(SERVER_REJECTED)
      }
      onClose()
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Duplicate to multiple projects" onClose={onClose}>
      <form onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        {projects === null ? (
          <Spinner />
        ) : projects.length === 0 ? (
          <p className="alert alert-info">There is no other project available.</p>
        ) : (
          <>
            <label htmlFor="dup-projects">Projects</label>
            <select
              id="dup-projects"
              multiple
              size={Math.min(10, projects.length)}
              value={selected}
              onChange={(e) => setSelected(Array.from(e.target.selectedOptions, (o) => o.value))}
            >
              {projects.map((p) => (
                <option key={String(p.id)} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>
          </>
        )}
        <SubmitButtons submitting={submitting || selected.length === 0} onCancel={onClose} label="Duplicate" />
      </form>
    </Modal>
  )
}
