const request = require('supertest');
const createApp = require('../app');

// Mock mongoose models — no real DB needed
jest.mock('../models/message');
jest.mock('../models/user');

const Message = require('../models/message');
const User = require('../models/user');

const app = createApp();

describe('GET /api/messages', () => {
  it('devrait retourner une liste de messages (200)', async () => {
    const fakeMessages = [
      { id: '1', text: 'Bonjour', sender: 'Alice', type: 'text' },
      { id: '2', text: 'Alerte incendie', sender: 'Bob', type: 'alert' }
    ];
    Message.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(fakeMessages) }) });

    const res = await request(app).get('/api/messages');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].text).toBe('Bonjour');
  });

  it('devrait retourner 500 si la DB échoue', async () => {
    Message.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockRejectedValue(new Error('DB error')) }) });

    const res = await request(app).get('/api/messages');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/users', () => {
  it('devrait retourner les utilisateurs en ligne (200)', async () => {
    const fakeUsers = [{ id: 'u1', name: 'Alice', isOnline: true }];
    User.find.mockResolvedValue(fakeUsers);

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Alice');
  });
});

describe('GET /api/users/all', () => {
  it('devrait retourner tous les utilisateurs (200)', async () => {
    const fakeUsers = [
      { id: 'u1', name: 'Alice', isOnline: true },
      { id: 'u2', name: 'Bob', isOnline: false }
    ];
    User.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeUsers) });

    const res = await request(app).get('/api/users/all');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('POST /api/alert', () => {
  it('devrait envoyer une alerte avec succès (200)', async () => {
    const mockSave = jest.fn().mockResolvedValue({});
    Message.mockImplementation(() => ({ save: mockSave }));

    const res = await request(app)
      .post('/api/alert')
      .send({ text: 'Incendie rue de la Paix', priority: 'high' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('devrait retourner 400 si text est absent', async () => {
    const res = await request(app)
      .post('/api/alert')
      .send({ priority: 'low' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Alert text is required');
  });
});

describe('DELETE /api/messages', () => {
  it('devrait supprimer tous les messages (200)', async () => {
    Message.deleteMany.mockResolvedValue({ deletedCount: 5 });

    const res = await request(app).delete('/api/messages');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
