import { createContext, useContext } from 'react'
import type { User } from './AuthContext'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isResourceAllowed: (resourceType: string) => boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
