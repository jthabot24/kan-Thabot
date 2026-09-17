import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../../api/procedures'
import type { Project } from '../../api/types'
import { Alert, Spinner, errorMessage } from '../../components/ui'

// Minimal entry point until the board/project streams land: pick a project to create a
// task in, or jump straight to a task by id.
export function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [taskId, setTaskId] = useState('')

  useEffect(() => {
    api.getMyProjects().then(setProjects).catch((e: unknown) => setError(errorMessage(e)))
  }, [])

  function openTask(event: FormEvent) {
    event.preventDefault()
    const id = taskId.replace('#', '').trim()
    if (id) navigate(`/tasks/${id}`)
  }

  return (
    <div className="page">
      <h2>Tasks</h2>
      <form className="inline-form" onSubmit={openTask}>
        <label htmlFor="goto-task">Open task</label>
        <input id="goto-task" type="text" placeholder="#123" value={taskId} onChange={(e) => setTaskId(e.target.value)} />
        <button type="submit" className="btn">
          Go
        </button>
      </form>

      <h3>Create a task in a project</h3>
      {error && <Alert>{error}</Alert>}
      {projects === null ? (
        <Spinner />
      ) : (
        <ul className="project-list">
          {projects.map((p) => (
            <li key={String(p.id)}>
              <Link to={`/projects/${String(p.id)}/tasks/new`}>{p.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
