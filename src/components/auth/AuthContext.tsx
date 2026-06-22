import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from '@/types/api'
import { login as apiLogin, me } from '@/api/auth'
import { setToken, removeToken, getToken } from '@/api/client'

interface AuthState {
  user: User | null
  loading: boolean
  login: (teamCode: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    me()
      .then(setUser)
      .catch(() => removeToken())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(
    async (teamCode: string, email: string, password: string) => {
      const res = await apiLogin(teamCode, email, password)
      setToken(res.token)
      setUser(res.user)
    },
    [],
  )

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
