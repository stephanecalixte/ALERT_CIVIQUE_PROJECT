const request = require('supertest');
const createApp = require('../app');

const app = createApp();

describe('GET /health', () => {
  it('devrait retourner status OK (200)', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('GET /', () => {
  it('devrait retourner les informations du serveur (200)', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alert Civique Server');
    expect(res.body.version).toBe('2.1.0');
  });
});

describe('Route inconnue', () => {
  it('devrait retourner 404 pour une route inexistante', async () => {
    const res = await request(app).get('/api/inexistant');

    expect(res.status).toBe(404);
  });
});
