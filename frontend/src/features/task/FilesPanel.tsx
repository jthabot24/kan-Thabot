import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import * as api from '../../api/procedures'
import type { TaskFile } from '../../api/types'
import { Markdown } from '../../components/Markdown'
import { Alert, ConfirmDialog, Modal, Spinner, errorMessage } from '../../components/ui'
import {
  base64ToBlob,
  base64ToText,
  displayName,
  fileToBase64,
  formatBytes,
  formatDateTime,
  isTruthy,
  mimeType,
  previewType,
} from './format'
import type { TaskDetail } from './hooks'
import { SERVER_REJECTED } from './validation'

type Dialog = { kind: 'view'; file: TaskFile } | { kind: 'remove'; file: TaskFile } | null

// Port of app/Template/task_file/files.php + images.php
export function FilesPanel({ detail, onChanged }: { detail: TaskDetail; onChanged: () => void }) {
  const { task, files } = detail
  const [dialog, setDialog] = useState<Dialog>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const images = files.filter((f) => isTruthy(f.is_image))
  const documents = files.filter((f) => !isTruthy(f.is_image))

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files
    if (!selected || selected.length === 0) return
    setError(null)
    setUploading(true)
    try {
      for (const file of Array.from(selected)) {
        const blob = await fileToBase64(file)
        const id = await api.createTaskFile(task.project_id, task.id, file.name, blob)
        if (id === false) throw new Error(SERVER_REJECTED)
      }
      onChanged()
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function download(file: TaskFile) {
    setError(null)
    try {
      const content = await api.downloadTaskFile(file.id)
      const blob = base64ToBlob(content, mimeType(file.name, isTruthy(file.is_image)))
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = file.name
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (e: unknown) {
      setError(errorMessage(e))
    }
  }

  async function remove(file: TaskFile) {
    setError(null)
    try {
      await api.removeTaskFile(file.id)
      setDialog(null)
      onChanged()
    } catch (e: unknown) {
      setError(errorMessage(e))
    }
  }

  function actions(file: TaskFile) {
    const type = previewType(file.name, isTruthy(file.is_image))
    return (
      <span className="file-actions">
        {type && (
          <>
            <button type="button" className="btn-link" onClick={() => setDialog({ kind: 'view', file })}>
              View file
            </button>{' '}
          </>
        )}
        <button type="button" className="btn-link" onClick={() => download(file)}>
          Download
        </button>{' '}
        <button type="button" className="btn-link" onClick={() => setDialog({ kind: 'remove', file })}>
          Remove
        </button>
      </span>
    )
  }

  return (
    <section className="task-panel" id="attachments">
      <div className="panel-header">
        <h3>Attachments</h3>
        <label className={`btn btn-small${uploading ? ' disabled' : ''}`}>
          {uploading ? 'Uploading…' : 'Attach a document'}
          <input ref={inputRef} type="file" multiple hidden disabled={uploading} onChange={upload} />
        </label>
      </div>
      {error && <Alert>{error}</Alert>}

      {files.length === 0 && <p className="empty">There is no attachment at the moment.</p>}

      {images.length > 0 && (
        <ul className="file-thumbnails">
          {images.map((file) => (
            <li key={String(file.id)} className="file-thumbnail">
              <Thumbnail file={file} onClick={() => setDialog({ kind: 'view', file })} />
              <div className="file-thumbnail-content">
                <div className="file-thumbnail-title">{file.name}</div>
                <div className="file-thumbnail-description">
                  {file.username && <>{displayName(file.user_name, file.username)} · </>}
                  {formatDateTime(file.date)} · {formatBytes(file.size)}
                </div>
                {actions(file)}
              </div>
            </li>
          ))}
        </ul>
      )}

      {documents.length > 0 && (
        <table className="files-table">
          <tbody>
            {documents.map((file) => (
              <tr key={String(file.id)}>
                <td>
                  <strong>{file.name}</strong>
                  <br />
                  <small>
                    {file.username && <>{displayName(file.user_name, file.username)} · </>}
                    {formatDateTime(file.date)} · {formatBytes(file.size)}
                  </small>
                </td>
                <td className="actions">{actions(file)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dialog?.kind === 'view' && <FileViewer file={dialog.file} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'remove' && (
        <ConfirmDialog
          title="Remove a file"
          message={
            <>
              Do you really want to remove this file: <strong>{dialog.file.name}</strong>?
            </>
          }
          onClose={() => setDialog(null)}
          onConfirm={() => remove(dialog.file)}
        />
      )}
    </section>
  )
}

function useFileContent(file: TaskFile) {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setContent(null)
    api
      .downloadTaskFile(file.id)
      .then((value) => {
        if (!cancelled) setContent(value)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e))
      })
    return () => {
      cancelled = true
    }
  }, [file.id])

  return { content, error }
}

function useObjectUrl(content: string | null, type: string): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (content === null) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(base64ToBlob(content, type))
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [content, type])
  return url
}

function Thumbnail({ file, onClick }: { file: TaskFile; onClick: () => void }) {
  const { content } = useFileContent(file)
  const url = useObjectUrl(content, mimeType(file.name, true))
  return (
    <button type="button" className="thumbnail-button" onClick={onClick} title={file.name}>
      {url ? <img src={url} alt={file.name} /> : <span className="thumbnail-placeholder">…</span>}
    </button>
  )
}

// Port of app/Template/file_viewer/show.php
export function FileViewer({ file, onClose }: { file: TaskFile; onClose: () => void }) {
  const isImage = isTruthy(file.is_image)
  const type = previewType(file.name, isImage)
  const { content, error } = useFileContent(file)
  const url = useObjectUrl(content, mimeType(file.name, isImage))

  let body = null
  if (error) {
    body = <Alert>{error}</Alert>
  } else if (content === null) {
    body = <Spinner />
  } else if (type === 'image') {
    body = url ? <img className="file-viewer-image" src={url} alt={file.name} /> : null
  } else if (type === 'markdown') {
    body = (
      <div className="markdown">
        <Markdown text={base64ToText(content)} />
      </div>
    )
  } else if (type === 'text') {
    body = <pre className="file-viewer-text">{base64ToText(content)}</pre>
  } else if (type === 'pdf') {
    body = url ? <iframe className="file-viewer-pdf" src={url} title={file.name} /> : null
  } else {
    body = <p>This file type cannot be previewed.</p>
  }

  return (
    <Modal title={file.name} onClose={onClose} size="large">
      <div className="file-viewer">
        <p className="file-viewer-actions">
          {url && (
            <>
              <a href={url} target="_blank" rel="noreferrer noopener">
                Open in browser
              </a>{' '}
              ·{' '}
              <a href={url} download={file.name}>
                Download
              </a>
            </>
          )}
        </p>
        {body}
      </div>
    </Modal>
  )
}
