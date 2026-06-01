const request = require('supertest');
const createApp = require('../app');

jest.mock('../models/livestream');

const LiveStream = require('../models/livestream');

const app = createApp();

const fakeStream = {
  livestreamId: 1,
  userId: 'user42',
  status: 'active',
  startedAt: new Date().toISOString(),
  facing: 'back'
};

describe('POST /api/livestream/start', () => {
  it('devrait démarrer un nouveau stream (200)', async () => {
    LiveStream.findOne
      .mockResolvedValueOnce(null)  // pas de stream actif existant
      .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(null) }); // lastStream = null

    const mockSave = jest.fn().mockResolvedValue({});
    LiveStream.mockImplementation(() => ({ ...fakeStream, save: mockSave }));

    const res = await request(app)
      .post('/api/livestream/start')
      .send({ userId: 'user42', facing: 'back' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('livestreamId');
  });

  it('devrait retourner le stream existant si déjà actif (200)', async () => {
    LiveStream.findOne.mockResolvedValueOnce(fakeStream);

    const res = await request(app)
      .post('/api/livestream/start')
      .send({ userId: 'user42' });

    expect(res.status).toBe(200);
    expect(res.body.existing).toBe(true);
    expect(res.body.livestreamId).toBe(1);
  });

  it('devrait retourner 400 si userId est absent', async () => {
    const res = await request(app)
      .post('/api/livestream/start')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('userId requis');
  });
});

describe('POST /api/livestream/end', () => {
  it('devrait terminer un stream existant (200)', async () => {
    const endedStream = { ...fakeStream, status: 'ended', endedAt: new Date() };
    LiveStream.findOneAndUpdate.mockResolvedValue(endedStream);

    const res = await request(app)
      .post('/api/livestream/end')
      .send({ livestreamId: 1, duration: 120 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('devrait retourner 400 si livestreamId est absent', async () => {
    const res = await request(app)
      .post('/api/livestream/end')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('livestreamId requis');
  });

  it('devrait retourner 404 si stream non trouvé', async () => {
    LiveStream.findOneAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/livestream/end')
      .send({ livestreamId: 9999 });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/livestream/list', () => {
  it('devrait retourner la liste des streams (200)', async () => {
    const fakeList = [fakeStream, { ...fakeStream, livestreamId: 2 }];
    LiveStream.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(fakeList) })
    });

    const res = await request(app).get('/api/livestream/list');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('devrait filtrer par userId via query param', async () => {
    LiveStream.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([fakeStream]) })
    });

    const res = await request(app).get('/api/livestream/list?userId=user42');

    expect(res.status).toBe(200);
    expect(LiveStream.find).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user42' }));
  });
});

describe('GET /api/livestream/active/:userId', () => {
  it('devrait retourner le stream actif d\'un utilisateur (200)', async () => {
    LiveStream.findOne.mockResolvedValue(fakeStream);

    const res = await request(app).get('/api/livestream/active/user42');

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('user42');
  });

  it('devrait retourner 404 si aucun stream actif', async () => {
    LiveStream.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/livestream/active/user99');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/livestream/:livestreamId', () => {
  it('devrait retourner un stream par ID (200)', async () => {
    LiveStream.findOne.mockResolvedValue(fakeStream);

    const res = await request(app).get('/api/livestream/1');

    expect(res.status).toBe(200);
    expect(res.body.livestreamId).toBe(1);
  });

  it('devrait retourner 404 si stream non trouvé', async () => {
    LiveStream.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/livestream/9999');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/livestream/update', () => {
  it('devrait mettre à jour un stream avec videoUrl (200)', async () => {
    const updated = { ...fakeStream, videoUrl: 'http://video.example.com/v.mp4', videoId: 'vid-abc' };
    LiveStream.findOneAndUpdate.mockResolvedValue(updated);

    const res = await request(app)
      .post('/api/livestream/update')
      .send({ livestreamId: 1, videoUrl: 'http://video.example.com/v.mp4', videoId: 'vid-abc' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('devrait retourner 400 si livestreamId absent', async () => {
    const res = await request(app)
      .post('/api/livestream/update')
      .send({ videoUrl: 'http://video.example.com/v.mp4' });

    expect(res.status).toBe(400);
  });
});
