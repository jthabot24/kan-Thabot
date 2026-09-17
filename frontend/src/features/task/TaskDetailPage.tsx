import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TASK_STATUS_OPEN } from '../../api/types'
import { useCurrentUser } from '../../auth/AuthContext'
import { Markdown } from '../../components/Markdown'
import { Alert, Modal, Spinner } from '../../components/ui'
import { CommentsPanel } from './CommentsPanel'
import { FilesPanel } from './FilesPanel'
import { toNumber } from './format'
import { useProjectContext, useTaskDetail } from './hooks'
import { ExternalLinksPanel, InternalLinksPanel } from './LinksPanels'
import { SubtasksPanel } from './SubtasksPanel'
import { MovePositionDialog, ProjectTransferDialog, RecurrenceDialog, RemoveDialog, StatusDialog } from './TaskActions'
import { TaskForm } from './TaskForm'
import { RecurrenceInfo, TaskSummary, TimeTrackingSummary } from './TaskSummary'

type Action = 'edit' | 'recurrence' | 'duplicate' | 'move' | 'position' | 'status' | 'remove' | null

// Port of app/Template/task/show.php + layout.php + sidebar.php
export function TaskDetailPage() {
  const params = useParams<{ taskId: string }>()
  const taskId = params.taskId ?? ''
  const me = useCurrentUser()
  const navigate = useNavigate()
  const { detail, error, refresh } = useTaskDetail(taskId, me.id)
  const { context: projectContext } = useProjectContext(detail?.task.project_id)
  const [action, setAction] = useState<Action>(null)

  const close = useCallback(() => setAction(null), [])
  const closeAndRefresh = useCallback(() => {
    setAction(null)
    refresh()
  }, [refresh])

  if (error) {
    return (
      <div className="page">
        <Alert>{error}</Alert>
        <Link to="/">Back</Link>
      </div>
    )
  }
  if (!detail) return <Spinner />

  const { task, project } = detail
  const isOpen = toNumber(task.is_active) === TASK_STATUS_OPEN
  const mailto = `mailto:?subject=${encodeURIComponent(`#${String(task.id)} ${task.title}`)}&body=${encodeURIComponent(window.location.href)}`

  return (
    <div className="page task-page">
      <nav className="breadcrumb">
        <Link to={`/projects/${String(project.id)}/tasks/new`}>{project.name}</Link> › Task #{String(task.id)}
      </nav>

      <div className="task-layout">
        <aside className="task-sidebar">
          <h4>Actions</h4>
          <ul>
            <li>
              <button type="button" className="btn-link" onClick={() => setAction('edit')}>
                Edit the task
              </button>
            </li>
            <li>
              <button type="button" className="btn-link" onClick={() => setAction('recurrence')}>
                Edit recurrence
              </button>
            </li>
            <li>
              <a href="#subtasks">Add a sub-task</a>
            </li>
            <li>
              <a href="#internal-links">Add internal link</a>
            </li>
            <li>
              <a href="#external-links">Add external link</a>
            </li>
            <li>
              <a href="#comments">Add a comment</a>
            </li>
            <li>
              <a href="#attachments">Attach a document</a>
            </li>
            <li>
              <button type="button" className="btn-link" onClick={() => setAction('duplicate')}>
                Duplicate to another project
              </button>
            </li>
            <li>
              <button type="button" className="btn-link" onClick={() => setAction('move')}>
                Move to another project
              </button>
            </li>
            <li>
              <a href={mailto}>Send by email</a>
            </li>
            <li>
              <button type="button" className="btn-link" onClick={() => setAction('position')}>
                Move position
              </button>
            </li>
            <li>
              <button type="button" className="btn-link" onClick={() => setAction('status')}>
                {isOpen ? 'Close this task' : 'Open this task'}
              </button>
            </li>
            <li>
              <button type="button" className="btn-link btn-danger" onClick={() => setAction('remove')}>
                Remove
              </button>
            </li>
          </ul>
        </aside>

        <main className="task-main">
          <TaskSummary detail={detail} />
          <TimeTrackingSummary detail={detail} />
          <RecurrenceInfo detail={detail} />

          <section className="task-panel" id="description">
            <h3>Description</h3>
            {task.description ? (
              <div className="markdown">
                <Markdown text={task.description} />
              </div>
            ) : (
              <p className="empty">There is no description.</p>
            )}
          </section>

          <SubtasksPanel detail={detail} onChanged={refresh} />
          <InternalLinksPanel detail={detail} onChanged={refresh} />
          <ExternalLinksPanel detail={detail} onChanged={refresh} />
          <FilesPanel detail={detail} onChanged={refresh} />
          <CommentsPanel detail={detail} onChanged={refresh} />
        </main>
      </div>

      {action === 'edit' && (
        <Modal title="Edit a task" onClose={close} size="large">
          {projectContext ? (
            <TaskForm context={projectContext} task={task} tags={detail.tags} onSaved={closeAndRefresh} onCancel={close} />
          ) : (
            <Spinner />
          )}
        </Modal>
      )}
      {action === 'recurrence' && <RecurrenceDialog detail={detail} onSaved={closeAndRefresh} onClose={close} />}
      {action === 'status' && <StatusDialog task={task} onDone={closeAndRefresh} onClose={close} />}
      {action === 'remove' && (
        <RemoveDialog
          task={task}
          onClose={close}
          onDone={() => navigate(`/projects/${String(project.id)}/tasks/new`, { replace: true })}
        />
      )}
      {action === 'position' && <MovePositionDialog detail={detail} onDone={closeAndRefresh} onClose={close} />}
      {(action === 'duplicate' || action === 'move') && (
        <ProjectTransferDialog
          task={task}
          mode={action}
          onClose={close}
          onDone={(newTaskId) => {
            setAction(null)
            if (newTaskId !== null) navigate(`/tasks/${newTaskId}`)
            else refresh()
          }}
        />
      )}
    </div>
  )
}
