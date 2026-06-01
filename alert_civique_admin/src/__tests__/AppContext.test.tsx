/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { AppProvider, useApp } from '../contexts/AppContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

const fakeUser = {
  token: 'jwt-xyz',
  userId: 1,
  email: 'admin@test.com',
  firstname: 'Admin',
  lastname: 'Test',
  isAdmin: true,
}

// ─── useApp ──────────────────────────────────────────────────────────────────

describe('useApp', () => {
  it('lance une erreur si utilisé hors AppProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useApp())).toThrow('useApp must be used within AppProvider')
    spy.mockRestore()
  })
})

// ─── AppProvider — état initial ───────────────────────────────────────────────

describe('AppProvider — état initial', () => {
  beforeEach(() => localStorage.clear())

  it('section par défaut est dashboard', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    expect(result.current.section).toBe('dashboard')
  })

  it('token vide si rien en localStorage', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    expect(result.current.token).toBe('')
  })

  it('currentUser null si rien en localStorage', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    expect(result.current.currentUser).toBeNull()
  })

  it('charge le token depuis localStorage', () => {
    localStorage.setItem('token', 'saved-token')
    localStorage.setItem('currentUser', JSON.stringify(fakeUser))
    const { result } = renderHook(() => useApp(), { wrapper })
    expect(result.current.token).toBe('saved-token')
    expect(result.current.currentUser?.email).toBe('admin@test.com')
  })
})

// ─── login / logout ──────────────────────────────────────────────────────────

describe('AppProvider — login / logout', () => {
  beforeEach(() => localStorage.clear())

  it('login définit le token et l\'utilisateur courant', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => result.current.login(fakeUser))
    expect(result.current.token).toBe('jwt-xyz')
    expect(result.current.currentUser?.email).toBe('admin@test.com')
  })

  it('login persiste le token dans localStorage', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => result.current.login(fakeUser))
    expect(localStorage.getItem('token')).toBe('jwt-xyz')
  })

  it('logout vide le token et l\'utilisateur', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => result.current.login(fakeUser))
    act(() => result.current.logout())
    expect(result.current.token).toBe('')
    expect(result.current.currentUser).toBeNull()
  })

  it('logout supprime token du localStorage', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => result.current.login(fakeUser))
    act(() => result.current.logout())
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('currentUser')).toBeNull()
  })

  it('logout remet la section à dashboard', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => result.current.login(fakeUser))
    act(() => result.current.navigate('reports'))
    act(() => result.current.logout())
    expect(result.current.section).toBe('dashboard')
  })
})

// ─── navigate ─────────────────────────────────────────────────────────────────

describe('AppProvider — navigate', () => {
  it('change la section active', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => result.current.navigate('reports'))
    expect(result.current.section).toBe('reports')
    act(() => result.current.navigate('users'))
    expect(result.current.section).toBe('users')
  })
})

// ─── toast ────────────────────────────────────────────────────────────────────

describe('AppProvider — toast', () => {
  it('ajoute un toast avec message et type', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => result.current.toast('Opération réussie', 'success'))
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Opération réussie')
    expect(result.current.toasts[0].type).toBe('success')
  })

  it('type par défaut est info', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => result.current.toast('Info'))
    expect(result.current.toasts[0].type).toBe('info')
  })

  it('se retire automatiquement après 3800 ms', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => result.current.toast('Temporaire'))
    expect(result.current.toasts).toHaveLength(1)
    await act(async () => { vi.advanceTimersByTime(4000) })
    expect(result.current.toasts).toHaveLength(0)
    vi.useRealTimers()
  })

  it('plusieurs toasts s\'accumulent', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => {
      result.current.toast('Un')
      result.current.toast('Deux')
    })
    expect(result.current.toasts).toHaveLength(2)
  })
})

// ─── setLoading ───────────────────────────────────────────────────────────────

describe('AppProvider — setLoading', () => {
  it('modifie l\'état loading', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => result.current.setLoading(true))
    expect(result.current.loading).toBe(true)
    act(() => result.current.setLoading(false))
    expect(result.current.loading).toBe(false)
  })
})
