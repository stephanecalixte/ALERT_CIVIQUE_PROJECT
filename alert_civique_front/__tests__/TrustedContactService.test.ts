import TrustedContactService from '../app/lib/services/TrustedContactService'

const mockFetch = jest.fn()
global.fetch = mockFetch

const TOKEN = 'test-token'
const FAKE_CONTACT = {
  id: 1,
  name: 'Marie Dupont',
  phone: '0600000001',
  email: 'marie@test.com',
  userId: 42,
}

// ─── getByUserId ─────────────────────────────────────────────────────────────

describe('TrustedContactService.getByUserId', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne les contacts de confiance d\'un utilisateur', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [FAKE_CONTACT],
    })

    const result = await TrustedContactService.getByUserId(42, TOKEN)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Marie Dupont')
    expect(result[0].id).toBe(1)
  })

  it('appelle GET /api/trusted-contacts/user/{userId}', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] })
    await TrustedContactService.getByUserId(42, TOKEN)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/trusted-contacts/user/42',
      expect.objectContaining({
        headers: { Authorization: `Bearer ${TOKEN}` },
      })
    )
  })

  it('fonctionne sans token (requête anonyme)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] })
    const result = await TrustedContactService.getByUserId(42, null)
    expect(result).toEqual([])
    const headers = (mockFetch.mock.calls[0][1] as RequestInit).headers as Record<string, string>
    expect(headers['Authorization']).toBeUndefined()
  })

  it('retourne un tableau vide si réponse non-ok (404)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })
    const result = await TrustedContactService.getByUserId(9999, TOKEN)
    expect(result).toEqual([])
  })

  it('retourne un tableau vide si erreur réseau', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const result = await TrustedContactService.getByUserId(42, TOKEN)
    expect(result).toEqual([])
  })
})

// ─── create ──────────────────────────────────────────────────────────────────

describe('TrustedContactService.create', () => {
  beforeEach(() => mockFetch.mockClear())

  it('crée un contact de confiance et retourne ses données', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_CONTACT),
    })

    const result = await TrustedContactService.create(
      { name: 'Marie Dupont', phone: '0600000001', email: 'marie@test.com', userId: 42 } as any,
      TOKEN
    )
    expect(result?.id).toBe(1)
    expect(result?.name).toBe('Marie Dupont')
  })

  it('appelle POST /api/trusted-contacts avec Content-Type JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_CONTACT),
    })

    await TrustedContactService.create({ name: 'Test' } as any, TOKEN)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/trusted-contacts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    )
  })

  it('retourne null si erreur réseau', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const result = await TrustedContactService.create({ name: '' } as any, TOKEN)
    expect(result).toBeNull()
  })

  it('retourne null si réponse non-ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Données invalides',
    })

    const result = await TrustedContactService.create({ name: '' } as any, TOKEN)
    expect(result).toBeNull()
  })
})

// ─── delete ──────────────────────────────────────────────────────────────────

describe('TrustedContactService.delete', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne true si suppression réussie', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    const result = await TrustedContactService.delete(1, TOKEN)
    expect(result).toBe(true)
  })

  it('appelle DELETE /api/trusted-contacts/{id}', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    await TrustedContactService.delete(7, TOKEN)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/trusted-contacts/7',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('retourne false si erreur réseau', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network'))
    const result = await TrustedContactService.delete(1, TOKEN)
    expect(result).toBe(false)
  })

  it('retourne false si réponse non-ok (403)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 })
    const result = await TrustedContactService.delete(1, TOKEN)
    expect(result).toBe(false)
  })
})
