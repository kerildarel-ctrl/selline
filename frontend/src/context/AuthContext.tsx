import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import { api } from '../api'

interface AuthCtx { user: User | null; token: string | null; login: (t: string, u: User) => void; logout: () => void; refresh: () => Promise<void>; loading: boolean }
const Ctx = createContext<AuthCtx>(null!)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))
  useEffect(() => {
    if (token) api.me().then(u => { setUser(u); localStorage.setItem('user', JSON.stringify(u)) }).catch(() => { setToken(null); setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user') }).finally(() => setLoading(false))
    else setLoading(false)
  }, [])
  const login = (tok: string, u: User) => { localStorage.setItem('token', tok); localStorage.setItem('user', JSON.stringify(u)); setToken(tok); setUser(u) }
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null) }
  const refresh = async () => { const u = await api.me(); setUser(u); localStorage.setItem('user', JSON.stringify(u)) }
  return <Ctx.Provider value={{ user, token, login, logout, refresh, loading }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
