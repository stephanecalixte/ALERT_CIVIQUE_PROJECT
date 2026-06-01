import { loginUser } from '../app/lib/services/LoginService'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('loginUser', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne les données de connexion (200)', async () => {
    const serverData = {
      token: 'jwt-abc123',
      userId: 42,
      firstname: 'Alice',
      lastname: 'Dupont',
      email: 'alice@test.com',
      isAdmin: false,
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(serverData),
    })

    const result = await loginUser('alice@test.com', 'motdepasse')
    expect(result.token).toBe('jwt-abc123')
    expect(result.userId).toBe(42)
    expect(result.email).toBe('alice@test.com')
    expect(result.firstname).toBe('Alice')
    expect(result.isAdmin).toBe(false)
  })

  it('utilise accessToken comme fallback si token absent', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ accessToken: 'fallback-token', userId: 1 }),
    })

    const result = await loginUser('a@test.com', 'pass')
    expect(result.token).toBe('fallback-token')
  })

  it('utilise l\'email passé en paramètre si absent de la réponse', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ token: 't', userId: 5 }),
    })

    const result = await loginUser('user@test.com', 'pass')
    expect(result.email).toBe('user@test.com')
  })

  it('lance une erreur si le serveur retourne 401', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Identifiants incorrects',
    })

    await expect(loginUser('bad@test.com', 'mauvais')).rejects.toThrow('Identifiants incorrects')
  })

  it('lance une erreur générique si body vide et non-ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => '',
    })

    await expect(loginUser('a@test.com', 'pass')).rejects.toThrow('HTTP 500')
  })

  it('appelle POST /api/auth/login avec le bon corps', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ token: 'tok', userId: 1 }),
    })

    await loginUser('user@test.com', 'pass123')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'user@test.com', password: 'pass123' }),
      })
    )
  })
})
