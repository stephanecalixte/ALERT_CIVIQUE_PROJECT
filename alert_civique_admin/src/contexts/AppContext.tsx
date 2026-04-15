import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import type { Toast, ToastType, Section, LoginResponse } from '../types'

interface AppContextType {
  token: string
  currentUser: LoginResponse | null
  section: Section
  toasts: Toast[]
  login: (data: LoginResponse) => void
  logout: () => void
  navigate: (s: Section) => void
  toast: (msg: string, type?: ToastType) => void
}

const Ctx = createContext<AppContextType>(null!)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken]           = useState('')
  const [currentUser, setUser]      = useState<LoginResponse | null>(null)
  const [section, setSection]       = useState<Section>('dashboard')
  const [toasts, setToasts]         = useState<Toast[]>([])
  const toastId                     = useRef(0)

  const login = useCallback((data: LoginResponse) => {
    setToken(data.token)
    setUser(data)
  }, [])

  const logout = useCallback(() => {
    setToken('')
    setUser(null)
    setSection('dashboard')
  }, [])

  const navigate = useCallback((s: Section) => setSection(s), [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800)
  }, [])

  return (
    <Ctx.Provider value={{ token, currentUser, section, toasts, login, logout, navigate, toast }}>
      {children}
    </Ctx.Provider>
  )
}
