import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import * as authApi from '../api/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await authApi.login(email, password)
    localStorage.setItem('token', token)
    setUser(u)
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { token, user: u } = await authApi.register(email, password, name)
    localStorage.setItem('token', token)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const u = await authApi.getMe()
    setUser(u)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
