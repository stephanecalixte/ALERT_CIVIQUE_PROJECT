// src/services/api.ts
import type {
  AdminReport, AdminAlert, AdminStream, AdminEmergency,
  AdminUser, LoginResponse,
} from '../types'

const BASE = 'http://localhost:9090'

function hdr(token: string): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

async function req<T>(method: string, path: string, token: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: hdr(token),
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}

export const api = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    })
    if (!res.ok) throw new Error('Identifiants incorrects')
    return res.json()
  },

  getReports:   (t: string) => req<AdminReport[]>('GET', '/api/report', t),
  updateReport: (id: number, status: string, t: string) =>
    req('PUT', `/api/report/${id}`, t, { status }),
  deleteReport: (id: number, t: string) => req('DELETE', `/api/report/${id}`, t),

  getAlerts:   (t: string) => req<AdminAlert[]>('GET', '/api/reportMessages', t),
  deleteAlert: (id: number, t: string) => req('DELETE', `/api/reportMessages/${id}`, t),

  getUsers:   (t: string) => req<AdminUser[]>('GET', '/api/users', t),
  deleteUser: (id: number, t: string) => req('DELETE', `/api/users/${id}`, t),

  getStreams:   (t: string) => req<AdminStream[]>('GET', '/api/livestream', t),
  deleteStream: (id: number, t: string) => req('DELETE', `/api/livestream/${id}`, t),

  getEmergencies:   (t: string) => req<AdminEmergency[]>('GET', '/api/emergencies', t),
  deleteEmergency:  (id: number, t: string) => req('DELETE', `/api/emergencies/${id}`, t),

  async getStats(token: string) {
    const [r, u, s, a] = await Promise.allSettled([
      req<AdminReport[]>('GET', '/api/report', token),
      req<AdminUser[]>('GET', '/api/users', token),
      req<AdminStream[]>('GET', '/api/livestream', token),
      req<AdminAlert[]>('GET', '/api/reportMessages', token),
    ])
    const reports   = r.status === 'fulfilled' ? r.value : []
    const users     = u.status === 'fulfilled' ? u.value : []
    const streams   = s.status === 'fulfilled' ? s.value : []
    const alerts    = a.status === 'fulfilled' ? a.value : []

    const byStatus = (reports as AdminReport[]).reduce<Record<string, number>>((acc, rep) => {
      acc[rep.status] = (acc[rep.status] ?? 0) + 1
      return acc
    }, {})
    return {
      reports, users, streams, alerts,
      totalReports: reports.length,
      totalUsers:   users.length,
      totalStreams:  streams.length,
      totalAlerts:  alerts.length,
      pending:   byStatus['PENDING']   ?? 0,
      inReview:  byStatus['IN_REVIEW'] ?? 0,
      validated: byStatus['VALIDATED'] ?? 0,
      resolved:  byStatus['RESOLVED']  ?? 0,
      rejected:  byStatus['REJECTED']  ?? 0,
      archived:  byStatus['ARCHIVED']  ?? 0,
    }
  },
}

// ✅ Correction : accepte null et undefined
export function fmtDate(v: string | number[] | null | undefined): string {
  if (!v) return '—'
  if (Array.isArray(v)) {
    const [y, m, d, h = 0, mn = 0] = v
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y} ${String(h).padStart(2, '0')}:${String(mn).padStart(2, '0')}`
  }
  try {
    const date = new Date(v)
    if (isNaN(date.getTime())) return String(v)
    return date.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return String(v) }
}

export const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente', IN_REVIEW: 'En cours', VALIDATED: 'Validé',
  RESOLVED: 'Résolu', REJECTED: 'Rejeté', ARCHIVED: 'Archivé',
}

export const ALERT_LABEL: Record<string, string> = {
  agression: '🚨 Agression', accident: '🚗 Accident',
  incendie: '🔥 Incendie', sos: '🆘 SOS',
}

export const NEXT_STATUS: Record<string, string[]> = {
  PENDING:   ['IN_REVIEW', 'REJECTED'],
  IN_REVIEW: ['VALIDATED', 'REJECTED'],
  VALIDATED: ['RESOLVED', 'ARCHIVED'],
  RESOLVED:  ['ARCHIVED'],
  REJECTED:  ['ARCHIVED'],
  ARCHIVED:  [],
}