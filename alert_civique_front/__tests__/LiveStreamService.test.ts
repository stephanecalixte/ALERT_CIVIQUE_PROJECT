import LiveStreamService from '../app/lib/services/LiveStreamService'

const mockFetch = jest.fn()
global.fetch = mockFetch

const TOKEN = 'test-token'

const FAKE_START = { livestreamId: 1, userId: 'user42', startedAt: '2024-06-01T10:00:00', status: 'LIVE' }
const FAKE_END   = { livestreamId: 1, status: 'ENDED', endedAt: '2024-06-01T11:00:00' }
const FAKE_LIST  = [
  { livestreamId: 1, status: 'ENDED', userId: 'user1' },
  { livestreamId: 2, status: 'LIVE',  userId: 'user2' },
]

// ─── startStream ─────────────────────────────────────────────────────────────

describe('LiveStreamService.startStream', () => {
  beforeEach(() => mockFetch.mockClear())

  it('démarre un stream et retourne les données (200)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_START),
    })

    const result = await LiveStreamService.startStream('user42', 'back', TOKEN)
    expect(result.livestreamId).toBe(1)
    expect(result.status).toBe('LIVE')
  })

  it('appelle POST /api/livestream/create avec Authorization', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_START),
    })

    await LiveStreamService.startStream('user42', 'back', TOKEN)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/livestream/create',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    )
  })

  it('lance une erreur HTTP si le serveur échoue (500)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Erreur serveur',
    })

    await expect(LiveStreamService.startStream('user42', 'back', TOKEN))
      .rejects.toThrow('HTTP 500')
  })
})

// ─── stopStream ──────────────────────────────────────────────────────────────

describe('LiveStreamService.stopStream', () => {
  beforeEach(() => mockFetch.mockClear())

  it('arrête un stream et retourne les données (200)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_END),
    })

    const result = await LiveStreamService.stopStream(1, 'user42', 120, TOKEN)
    expect(result.livestreamId).toBe(1)
    expect(result.status).toBe('ENDED')
  })

  it('appelle PUT /api/livestream/update avec status ENDED', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_END),
    })

    await LiveStreamService.stopStream(1, 'user42', 60, TOKEN)
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string)
    expect(body.livestreamId).toBe(1)
    expect(body.status).toBe('ENDED')
    expect(body.duration).toBe(60)
  })
})

// ─── updateStreamWithVideo ───────────────────────────────────────────────────

describe('LiveStreamService.updateStreamWithVideo', () => {
  beforeEach(() => mockFetch.mockClear())

  it('associe une URL vidéo au stream', async () => {
    const updated = { livestreamId: 1, videoUrl: 'http://cdn.test/video.mp4' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(updated),
    })

    const result = await LiveStreamService.updateStreamWithVideo(1, 'http://cdn.test/video.mp4', TOKEN)
    expect(result.videoUrl).toBe('http://cdn.test/video.mp4')
  })
})

// ─── getLiveStreams ───────────────────────────────────────────────────────────

describe('LiveStreamService.getLiveStreams', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne la liste de tous les streams', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_LIST),
    })

    const result = await LiveStreamService.getLiveStreams(TOKEN)
    expect(result).toHaveLength(2)
    expect(result[0].livestreamId).toBe(1)
  })

  it('retourne un tableau vide si erreur réseau', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const result = await LiveStreamService.getLiveStreams(TOKEN)
    expect(result).toEqual([])
  })

  it('retourne un tableau vide si réponse non-ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Erreur' })
    const result = await LiveStreamService.getLiveStreams(TOKEN)
    expect(result).toEqual([])
  })
})

// ─── getLiveStreamById ───────────────────────────────────────────────────────

describe('LiveStreamService.getLiveStreamById', () => {
  beforeEach(() => mockFetch.mockClear())

  it('retourne un stream par ID', async () => {
    const stream = { livestreamId: 2, status: 'LIVE', userId: 'user2' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(stream),
    })

    const result = await LiveStreamService.getLiveStreamById(2, TOKEN)
    expect(result?.livestreamId).toBe(2)
    expect(result?.status).toBe('LIVE')
  })

  it('retourne null si erreur réseau', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Not found'))
    const result = await LiveStreamService.getLiveStreamById(9999, TOKEN)
    expect(result).toBeNull()
  })

  it('retourne null si réponse non-ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, text: async () => '' })
    const result = await LiveStreamService.getLiveStreamById(9999, TOKEN)
    expect(result).toBeNull()
  })
})

// ─── sendLiveStreamData (compatibilité) ─────────────────────────────────────

describe('LiveStreamService.sendLiveStreamData', () => {
  beforeEach(() => mockFetch.mockClear())

  it('démarre un stream si pas de livestreamId dans le payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_START),
    })

    await LiveStreamService.sendLiveStreamData({ userId: 'user42', facing: 'back' }, TOKEN)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/livestream/create',
      expect.anything()
    )
  })

  it('arrête un stream si livestreamId présent dans le payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(FAKE_END),
    })

    await LiveStreamService.sendLiveStreamData({ livestreamId: 1, userId: 'user42', duration: 60 }, TOKEN)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9090/api/livestream/update',
      expect.objectContaining({ method: 'PUT' })
    )
  })
})
