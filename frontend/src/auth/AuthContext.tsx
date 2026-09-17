import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCredentials, setCredentials, type Credentials } from '../api/client'
import { getMe } from '../api/procedures'
import type { User } from '../api/types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(getCredentials() !== null)

  useEffect(() => {
    if (!getCredentials()) return
    getMe()
      .then(setUser)
      .catch(() => setCredentials(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials: Credentials) => {
    setCredentials(credentials)
    try {
      setUser(await getMe())
    } catch (error) {
      setCredentials(null)
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    setCredentials(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function useCurrentUser(): User {
  const { user } = useAuth()
  if (!user) throw new Error('No authenticated user')
  return user
}
