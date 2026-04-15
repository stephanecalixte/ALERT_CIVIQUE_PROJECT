// src/context/AppProvider.tsx
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import type { Toast, ToastType, Section, LoginResponse } from '../types'

interface AppContextType {
  token: string
  currentUser: LoginResponse | null
  section: Section
  toasts: Toast[]
  loading: boolean
  login: (data: LoginResponse) => void
  logout: () => void
  navigate: (s: Section) => void
  toast: (msg: string, type?: ToastType) => void
  setLoading: (loading: boolean) => void
}

const Ctx = createContext<AppContextType | null>(null)

export const useApp = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // État initial depuis localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [currentUser, setUser] = useState<LoginResponse | null>(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })
  const [section, setSection] = useState<Section>('dashboard')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loading, setLoading] = useState(false)
  const toastId = useRef(0)

  // Synchronisation avec localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  const login = useCallback((data: LoginResponse) => {
    setToken(data.token)
    setUser(data)
  }, [])

  const logout = useCallback(() => {
    setToken('')
    setUser(null)
    setSection('dashboard')
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
  }, [])

  const navigate = useCallback((s: Section) => setSection(s), [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3800)
  }, [])

  const value: AppContextType = {
    token,
    currentUser,
    section,
    toasts,
    loading,
    login,
    logout,
    navigate,
    toast,
    setLoading,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}