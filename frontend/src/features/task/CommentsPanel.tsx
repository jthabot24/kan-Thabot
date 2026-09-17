import { useState, type FormEvent } from 'react'
import * as api from '../../api/procedures'
import type { Comment, CommentVisibility, ValidationErrors } from '../../api/types'
import { useCurrentUser } from '../../auth/AuthContext'
import { Markdown } from '../../components/Markdown'
import { Alert, ConfirmDialog, FieldErrors, SubmitButtons, errorMessage } from '../../components/ui'
import { APP_ROLE_ADMIN, APP_ROLE_MANAGER, APP_ROLE_USER, COMMENT_VISIBILITY_LIST } from './constants'
import { displayName, formatDateTime, toNumber } from './format'
import type { TaskDetail } from './hooks'
import { SERVER_REJECTED, hasErrors, validateCommentCreation, validateCommentModification } from './validation'

const ROLE_RANK: Record<string, number> = { [APP_ROLE_USER]: 1, [APP_ROLE_MANAGER]: 2, [APP_ROLE_ADMIN]: 3 }

// Mirrors the visibility filtering in app/Template/comment/show.php
function canSee(comment: Comment, role: string): boolean {
  const required = ROLE_RANK[comment.visibility] ?? 1
  return (ROLE_RANK[role] ?? 0) >= required
}

export function CommentsPanel({ detail, onChanged }: { detail: TaskDetail; onChanged: () => void }) {
  const me = useCurrentUser()
  const { task, comments, projectRole } = detail
  const [sortAsc, setSortAsc] = useState(true)
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [editing, setEditing] = useState<Comment | null>(null)
  const [removing, setRemoving] = useState<Comment | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = me.role === APP_ROLE_ADMIN
  const isProjectManager = projectRole === 'project-manager'
  const visible = comments.filter((c) => canSee(c, me.role))
  const sorted = [...visible].sort((a, b) =>
    sortAsc ? toNumber(a.date_creation) - toNumber(b.date_creation) : toNumber(b.date_creation) - toNumber(a.date_creation),
  )

  async function remove(comment: Comment) {
    setError(null)
    try {
      await api.removeComment(comment.id)
      setRemoving(null)
      onChanged()
    } catch (e: unknown) {
      setError(errorMessage(e))
    }
  }

  return (
    <section className="task-panel" id="comments">
      <div className="panel-header">
        <h3>Comments</h3>
        <button type="button" className="btn-link" onClick={() => setSortAsc((v) => !v)}>
          Change sort order ({sortAsc ? 'oldest first' : 'newest first'})
        </button>
      </div>
      {error && <Alert>{error}</Alert>}

      {sorted.length === 0 && <p className="empty">There is no comment at the moment.</p>}

      {sorted.map((comment) => {
        const canEdit = isAdmin || isProjectManager || toNumber(comment.user_id) === toNumber(me.id)
        return (
          <article key={String(comment.id)} className="comment" id={`comment-${String(comment.id)}`}>
            <header className="comment-header">
              <strong>{displayName(comment.name, comment.username)}</strong>{' '}
              <small>
                {formatDateTime(comment.date_creation)}
                {toNumber(comment.date_modification) > toNumber(comment.date_creation) && (
                  <> · updated {formatDateTime(comment.date_modification)}</>
                )}
                {comment.visibility !== APP_ROLE_USER && (
                  <>
                    {' '}
                    · <em>{COMMENT_VISIBILITY_LIST[comment.visibility]}</em>
                  </>
                )}
              </small>
              <span className="comment-actions">
                <button type="button" className="btn-link" onClick={() => setReplyTo(comment)}>
                  Reply
                </button>
                {canEdit && (
                  <>
                    {' '}
                    <button type="button" className="btn-link" onClick={() => setEditing(comment)}>
                      Edit
                    </button>{' '}
                    <button type="button" className="btn-link" onClick={() => setRemoving(comment)}>
                      Remove
                    </button>
                  </>
                )}
              </span>
            </header>
            {editing && toNumber(editing.id) === toNumber(comment.id) ? (
              <CommentForm
                taskId={toNumber(task.id)}
                comment={comment}
                canSetVisibility={isAdmin}
                onSaved={() => {
                  setEditing(null)
                  onChanged()
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="comment-body markdown">
                <Markdown text={comment.comment} />
              </div>
            )}
          </article>
        )
      })}

      <h4>Add a comment</h4>
      <CommentForm
        key={replyTo ? String(replyTo.id) : 'new'}
        taskId={toNumber(task.id)}
        canSetVisibility={isAdmin}
        initialContent={replyTo ? `> ${replyTo.comment.split('\n').join('\n> ')}\n\n` : ''}
        onSaved={() => {
          setReplyTo(null)
          onChanged()
        }}
        onCancel={replyTo ? () => setReplyTo(null) : undefined}
      />

      {removing && (
        <ConfirmDialog
          title="Remove a comment"
          message="Do you really want to remove this comment?"
          onClose={() => setRemoving(null)}
          onConfirm={() => remove(removing)}
        />
      )}
    </section>
  )
}

// Port of app/Template/comment/create.php and edit.php
function CommentForm({
  taskId,
  comment,
  canSetVisibility,
  initialContent = '',
  onSaved,
  onCancel,
}: {
  taskId: number
  comment?: Comment
  canSetVisibility: boolean
  initialContent?: string
  onSaved: () => void
  onCancel?: () => void
}) {
  const me = useCurrentUser()
  const [content, setContent] = useState(comment?.comment ?? initialContent)
  const [visibility, setVisibility] = useState<CommentVisibility>(comment?.visibility ?? APP_ROLE_USER)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const values = { id: comment?.id, task_id: taskId, user_id: me.id, comment: content, visibility }
    const localErrors = comment ? validateCommentModification(values) : validateCommentCreation(values)
    setErrors(localErrors)
    if (hasErrors(localErrors)) return

    setSubmitting(true)
    try {
      const result = comment
        ? await api.updateComment(comment.id, content)
        : await api.createComment({ task_id: taskId, user_id: me.id, content, visibility })
      if (result === false) {
        setError(SERVER_REJECTED)
        return
      }
      setContent('')
      onSaved()
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="comment-form" onSubmit={onSubmit}>
      {error && <Alert>{error}</Alert>}
      <div className="editor-toolbar">
        <button type="button" className={`btn-link${!preview ? ' active' : ''}`} onClick={() => setPreview(false)}>
          Write
        </button>{' '}
        <button type="button" className={`btn-link${preview ? ' active' : ''}`} onClick={() => setPreview(true)}>
          Preview
        </button>
      </div>
      {preview ? (
        <div className="markdown preview">
          <Markdown text={content} />
        </div>
      ) : (
        <textarea
          rows={6}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your text in Markdown"
        />
      )}
      <FieldErrors errors={errors} field="comment" />

      {canSetVisibility && !comment && (
        <>
          <label htmlFor="comment-visibility">Visibility</label>
          <select
            id="comment-visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as CommentVisibility)}
          >
            {(Object.entries(COMMENT_VISIBILITY_LIST) as [CommentVisibility, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldErrors errors={errors} field="visibility" />
        </>
      )}

      <SubmitButtons submitting={submitting} onCancel={onCancel} label={comment ? 'Save' : 'Post comment'} />
    </form>
  )
}
