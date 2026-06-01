import { registerUser } from '../app/lib/services/RegisterService'

const mockFetch = jest.fn()
global.fetch = mockFetch

const PAYLOAD = {
  firstname: 'Alice',
  lastname:  'Dupont',
  email:     'alice@test.com',
  password:  'Secure123!',
  phone:     '0600000000',
  birthdate: '1990-01-15',
}

describe('registerUser', () => {
  beforeEach(() => mockFetch.mockClear())

  it('inscrit un utilisateur et retourne ses données (201)', async () => {
    const serverResponse = {
      id: 1,
      firstname: 'Alice',
      lastname:  'Dupont',
      email:     'alice@test.com',
      active:    false,
      createdAt: '2024-01-01',
      roles:     [{ name: 'USER' }],
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(serverResponse),
    })

    const result = await registerUser(PAYLOAD as any)
    expect(result.email).toBe('alice@test.com')
    expect(result.id).toBe(1)
    expect(result.active).toBe(false)
  })

  it('lance une erreur avec le message serveur si réponse non-ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Email déjà utilisé',
    })

    await expect(registerUser(PAYLOAD as any)).rejects.toThrow('Email déjà utilisé')
  })

  it('lance une erreur générique HTTP si body vide', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => '',
    })

    await expect(registerUser(PAYLOAD as any)).rejects.toThrow('HTTP 500')
  })

  it('appelle POST /api/auth/register avec le bon endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ id: 2 }),
    })

    await registerUser(PAYLOAD as any)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('envoie le payload complet dans le corps de la requête', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ id: 3 }),
    })

    await registerUser(PAYLOAD as any)

    const callBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string)
    expect(callBody.firstname).toBe('Alice')
    expect(callBody.email).toBe('alice@test.com')
    expect(callBody.password).toBe('Secure123!')
  })
})
