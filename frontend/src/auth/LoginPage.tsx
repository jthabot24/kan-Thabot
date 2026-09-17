import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login({ username, password })
      navigate(from, { replace: true })
    } catch {
      setError('Wrong credentials')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h2>Sign in</h2>
      </div>
      <form onSubmit={onSubmit} autoComplete="off">
        {error && <p className="alert alert-error">{error}</p>}
        <label htmlFor="form-username">Username</label>
        <input
          id="form-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
        />
        <label htmlFor="form-password">Password or API token</label>
        <input
          id="form-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="form-help">Credentials are sent with HTTP Basic auth to the JSON-RPC endpoint.</p>
        <div className="form-actions">
          <button type="submit" className="btn btn-blue" disabled={submitting}>
            Sign in
          </button>
        </div>
      </form>
    </div>
  )
}
