import ReportService from '../app/lib/services/ReportService'

const mockFetch = jest.fn()
global.fetch = mockFetch

const TOKEN = 'test-token'
const FAKE_REPORT = {
  reportId: 1,
  description: 'Incendie rue de la Paix',
  status: 'PENDING',
  anonymous: false,
  createdAt: '2024-06-01T10:00:00',
}

// ─── createReport ────────────────────────────────────────────────────────────

describe('ReportService.createReport', () => {
  beforeEach(() => mockFetch.mockClear())

  it('crée un signalement et retourne les données serveur (200)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_REPORT),
    })

    const result = await ReportService.createReport({ description: 'Incendie rue de la Paix' }, TOKEN)
    expect(result.reportId).toBe(1)
    expect(result.description).toBe('Incendie rue de la Paix')
  })

  it('appelle POST /api/report avec Authorization Bearer', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_REPORT),
    })

    await ReportService.createReport({ description: 'Test' }, TOKEN)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/report',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    )
  })

  it('ajoute status PENDING automatiquement dans le body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_REPORT),
    })

    await ReportService.createReport({ description: 'Test' }, TOKEN)

    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string)
    expect(body.status).toBe('PENDING')
  })

  it('lance une erreur HTTP si réponse non-ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Description requise',
    })

    await expect(ReportService.createReport({ description: '' }, TOKEN)).rejects.toThrow('HTTP 400')
  })
})

// ─── getAll ──────────────────────────────────────────────────────────────────

describe('ReportService.getAll', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne la liste de tous les signalements', async () => {
    const reports = [FAKE_REPORT, { ...FAKE_REPORT, reportId: 2 }]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => reports,
    })

    const result = await ReportService.getAll(TOKEN)
    expect(result).toHaveLength(2)
    expect(result[0].reportId).toBe(1)
  })

  it('fonctionne sans token (requête anonyme)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [FAKE_REPORT],
    })

    const result = await ReportService.getAll(null)
    expect(result).toHaveLength(1)
    const headers = (mockFetch.mock.calls[0][1] as RequestInit).headers as Record<string, string>
    expect(headers['Authorization']).toBeUndefined()
  })

  it('lance une erreur si le serveur retourne non-ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    await expect(ReportService.getAll(TOKEN)).rejects.toThrow('HTTP 500')
  })
})

// ─── getById ─────────────────────────────────────────────────────────────────

describe('ReportService.getById', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne le signalement correspondant à l\'ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => FAKE_REPORT,
    })

    const result = await ReportService.getById(1, TOKEN)
    expect(result?.reportId).toBe(1)
  })

  it('retourne null si réponse non-ok (404)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })
    const result = await ReportService.getById(9999, TOKEN)
    expect(result).toBeNull()
  })

  it('retourne null si erreur réseau', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const result = await ReportService.getById(1, TOKEN)
    expect(result).toBeNull()
  })
})

// ─── deleteReport ────────────────────────────────────────────────────────────

describe('ReportService.deleteReport', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne true si suppression réussie', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    const result = await ReportService.deleteReport(1, TOKEN)
    expect(result).toBe(true)
  })

  it('appelle DELETE /api/report/{id}', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    await ReportService.deleteReport(42, TOKEN)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/report/42',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('retourne false si erreur réseau', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network'))
    const result = await ReportService.deleteReport(1, TOKEN)
    expect(result).toBe(false)
  })

  it('retourne false si réponse non-ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 })
    const result = await ReportService.deleteReport(1, TOKEN)
    expect(result).toBe(false)
  })
})

// ─── update ──────────────────────────────────────────────────────────────────

describe('ReportService.update', () => {
  beforeEach(() => mockFetch.mockClear())

  it('met à jour un signalement et retourne les données', async () => {
    const updated = { ...FAKE_REPORT, status: 'VALIDATED' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(updated),
    })

    const result = await ReportService.update(1, { status: 'VALIDATED' as any }, TOKEN)
    expect(result?.status).toBe('VALIDATED')
  })

  it('appelle PUT /api/report/{id}', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_REPORT),
    })

    await ReportService.update(1, {}, TOKEN)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/report/1',
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('retourne null si réponse non-ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Non trouvé',
    })

    const result = await ReportService.update(9999, {}, TOKEN)
    expect(result).toBeNull()
  })
})
