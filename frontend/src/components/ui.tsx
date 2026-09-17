import { useEffect, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import type { ValidationErrors } from '../api/types'

export function FieldErrors({ errors, field }: { errors: ValidationErrors; field: string }) {
  const messages = errors[field]
  if (!messages || messages.length === 0) return null
  return (
    <ul className="form-errors">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  )
}

export function Alert({ kind = 'error', children }: { kind?: 'error' | 'success' | 'info'; children: ReactNode }) {
  return <p className={`alert alert-${kind}`}>{children}</p>
}

export function Modal({
  title,
  onClose,
  size = 'medium',
  children,
}: {
  title: string
  onClose: () => void
  size?: 'small' | 'medium' | 'large'
  children: ReactNode
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onMouseDown={onClose} role="presentation">
      <div
        className={`modal-box modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Yes',
  onConfirm,
  onClose,
  error,
}: {
  title: string
  message: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
  error?: string | null
}) {
  return (
    <Modal title={title} onClose={onClose} size="small">
      <div className="confirm">
        {error && <Alert>{error}</Alert>}
        <p className="alert alert-info">{message}</p>
        <div className="form-actions">
          <button type="button" className="btn btn-red" onClick={onConfirm}>
            {confirmLabel}
          </button>{' '}
          or{' '}
          <button type="button" className="btn-link" onClick={onClose}>
            cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function SubmitButtons({
  submitting,
  onCancel,
  label = 'Save',
}: {
  submitting: boolean
  onCancel?: () => void
  label?: string
}) {
  return (
    <div className="form-actions">
      <button type="submit" className="btn btn-blue" disabled={submitting}>
        {label}
      </button>
      {onCancel && (
        <>
          {' '}
          or{' '}
          <button type="button" className="btn-link" onClick={onCancel}>
            cancel
          </button>
        </>
      )}
    </div>
  )
}

export function Dropdown({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <details className="dropdown">
      <summary className="dropdown-toggle">{label}</summary>
      <ul className="dropdown-menu">{children}</ul>
    </details>
  )
}

export function Spinner() {
  return <p className="loading">Loading…</p>
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Unexpected error'
}
