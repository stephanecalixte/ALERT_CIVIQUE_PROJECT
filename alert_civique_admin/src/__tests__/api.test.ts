/// <reference types="vitest/globals" />
import { api, fmtDate, STATUS_LABEL, NEXT_STATUS } from '../services/api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// ─── fmtDate ────────────────────────────────────────────────────────────────

describe('fmtDate', () => {
  it('retourne — pour null', () => {
    expect(fmtDate(null)).toBe('—')
  })

  it('retourne — pour undefined', () => {
    expect(fmtDate(undefined)).toBe('—')
  })

  it('formate un tableau [année, mois, jour, heure, minute]', () => {
    expect(fmtDate([2024, 3, 15, 9, 30])).toBe('15/03/2024 09:30')
  })

  it('formate un tableau sans heure (défaut 00:00)', () => {
    expect(fmtDate([2024, 12, 1])).toBe('01/12/2024 00:00')
  })

  it('retourne la chaîne originale pour une date invalide', () => {
    expect(fmtDate('pas-une-date')).toBe('pas-une-date')
  })

  it('formate une chaîne ISO valide', () => {
    const result = fmtDate('2024-06-15T09:30:00')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })
})

// ─── STATUS_LABEL ────────────────────────────────────────────────────────────

describe('STATUS_LABEL', () => {
  it('contient tous les statuts traduits', () => {
    expect(STATUS_LABEL['PENDING']).toBe('En attente')
    expect(STATUS_LABEL['IN_REVIEW']).toBe('En cours')
    expect(STATUS_LABEL['VALIDATED']).toBe('Validé')
    expect(STATUS_LABEL['RESOLVED']).toBe('Résolu')
    expect(STATUS_LABEL['REJECTED']).toBe('Rejeté')
    expect(STATUS_LABEL['ARCHIVED']).toBe('Archivé')
  })
})

// ─── NEXT_STATUS ─────────────────────────────────────────────────────────────

describe('NEXT_STATUS', () => {
  it('PENDING peut passer à IN_REVIEW ou REJECTED', () => {
    expect(NEXT_STATUS['PENDING']).toContain('IN_REVIEW')
    expect(NEXT_STATUS['PENDING']).toContain('REJECTED')
  })

  it('IN_REVIEW peut passer à VALIDATED ou REJECTED', () => {
    expect(NEXT_STATUS['IN_REVIEW']).toContain('VALIDATED')
    expect(NEXT_STATUS['IN_REVIEW']).toContain('REJECTED')
  })

  it('ARCHIVED n\'a aucune transition possible', () => {
    expect(NEXT_STATUS['ARCHIVED']).toHaveLength(0)
  })
})

// ─── api.login ───────────────────────────────────────────────────────────────

describe('api.login', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne les données de connexion (200)', async () => {
    const data = {
      token: 'jwt-abc', userId: 1,
      email: 'admin@test.com', firstname: 'Admin', lastname: 'Test', isAdmin: true,
    }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data })

    const result = await api.login('admin@test.com', 'password')
    expect(result.token).toBe('jwt-abc')
    expect(result.email).toBe('admin@test.com')
    expect(result.isAdmin).toBe(true)
  })

  it('appelle le bon endpoint avec POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 't', userId: 1, email: 'a@b.com', firstname: '', lastname: '', isAdmin: false }),
    })
    await api.login('a@b.com', 'pass')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/auth/login',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('lance une erreur si identifiants incorrects (401)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 })
    await expect(api.login('bad@test.com', 'wrong')).rejects.toThrow('Identifiants incorrects')
  })
})

// ─── api.getReports ──────────────────────────────────────────────────────────

describe('api.getReports', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne la liste des signalements (200)', async () => {
    const reports = [
      { reportId: 1, status: 'PENDING', description: 'Incendie', anonymous: false, createdAt: '' },
      { reportId: 2, status: 'VALIDATED', description: 'Accident', anonymous: true, createdAt: '' },
    ]
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify(reports) })

    const result = await api.getReports('token-test')
    expect(result).toHaveLength(2)
    expect(result[0].reportId).toBe(1)
  })

  it('lance une erreur HTTP 403 si token invalide', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403, text: async () => '' })
    await expect(api.getReports('bad-token')).rejects.toThrow('HTTP 403')
  })
})

// ─── api.getUsers ────────────────────────────────────────────────────────────

describe('api.getUsers', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne la liste des utilisateurs', async () => {
    const users = [{ id: 1, firstname: 'Alice', lastname: 'Dupont', email: 'alice@test.com', active: true, createdAt: '', roles: [] }]
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify(users) })

    const result = await api.getUsers('token')
    expect(result).toHaveLength(1)
    expect(result[0].email).toBe('alice@test.com')
  })
})

// ─── api.deleteReport ────────────────────────────────────────────────────────

describe('api.deleteReport', () => {
  beforeEach(() => mockFetch.mockClear())

  it('supprime un signalement avec succès', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '' })
    await expect(api.deleteReport(1, 'token')).resolves.toBeDefined()
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/report/1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})

// ─── api.updateReport ────────────────────────────────────────────────────────

describe('api.updateReport', () => {
  beforeEach(() => mockFetch.mockClear())

  it('met à jour le statut d\'un signalement', async () => {
    const updated = { reportId: 1, status: 'VALIDATED', description: '', anonymous: false, createdAt: '' }
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify(updated) })

    const result = await api.updateReport(1, 'VALIDATED', 'token')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/report/1',
      expect.objectContaining({ method: 'PUT' })
    )
    expect((result as typeof updated).status).toBe('VALIDATED')
  })
})

// ─── api.getStats ────────────────────────────────────────────────────────────

describe('api.getStats', () => {
  beforeEach(() => mockFetch.mockClear())

  it('agrège les données de 4 endpoints et calcule les totaux', async () => {
    const reports = [
      { reportId: 1, status: 'PENDING',   description: '', anonymous: false, createdAt: '' },
      { reportId: 2, status: 'VALIDATED', description: '', anonymous: false, createdAt: '' },
      { reportId: 3, status: 'PENDING',   description: '', anonymous: false, createdAt: '' },
    ]
    const users   = [{ id: 1, firstname: 'A', lastname: 'B', email: 'a@b.com', active: true, createdAt: '', roles: [] }]
    const streams = [{ livestreamId: 1, status: 'ENDED' }]
    const alerts:  never[] = []

    mockFetch
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify(reports) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify(users) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify(streams) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify(alerts) })

    const stats = await api.getStats('token')
    expect(stats.totalReports).toBe(3)
    expect(stats.totalUsers).toBe(1)
    expect(stats.totalStreams).toBe(1)
    expect(stats.totalAlerts).toBe(0)
    expect(stats.pending).toBe(2)
    expect(stats.validated).toBe(1)
  })

  it('retourne des totaux à 0 si tous les endpoints échouent', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, text: async () => 'error' })
    const stats = await api.getStats('token')
    expect(stats.totalReports).toBe(0)
    expect(stats.totalUsers).toBe(0)
    expect(stats.totalStreams).toBe(0)
  })
})
