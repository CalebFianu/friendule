const request = require('supertest');
const app = require('../app');
const { signToken } = require('../middleware/auth');

jest.mock('../db', () => ({ pool: { query: jest.fn() } }));

const { pool } = require('../db');

const USER_ID = 'test-user-id';
let token;

beforeAll(() => { token = signToken(USER_ID); });
beforeEach(() => jest.clearAllMocks());

const auth = () => ({ Authorization: `Bearer ${token}` });

const FRIEND_ROW = {
  id: 'friend-1',
  name: 'Alice',
  color: 'oklch(0.70 0.15 25)',
  description: 'Best friend',
  timezone: 'America/New_York',
  created_at: 1000000,
};

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

describe('Auth guard on /friends', () => {
  test('returns 401 with no token', async () => {
    const res = await request(app).get('/friends');
    expect(res.status).toBe(401);
  });

  test('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/friends')
      .set('Authorization', 'Bearer not-a-valid-token');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /friends
// ---------------------------------------------------------------------------

describe('GET /friends', () => {
  test('returns list of friends for the authenticated user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [FRIEND_ROW] });

    const res = await request(app).get('/friends').set(auth());

    expect(res.status).toBe(200);
    expect(res.body.friends).toHaveLength(1);
    expect(res.body.friends[0].name).toBe('Alice');
  });

  test('returns an empty list when user has no friends', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/friends').set(auth());

    expect(res.status).toBe(200);
    expect(res.body.friends).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// POST /friends
// ---------------------------------------------------------------------------

describe('POST /friends', () => {
  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/friends')
      .set(auth())
      .send({ color: 'oklch(0.70 0.15 25)' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name is required/i);
  });

  test('creates a friend and returns 201', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // INSERT

    const res = await request(app)
      .post('/friends')
      .set(auth())
      .send({ name: 'Alice', color: 'oklch(0.70 0.15 25)', description: 'Best friend', timezone: 'America/New_York' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Alice');
    expect(res.body).toHaveProperty('id');
  });

  test('trims whitespace from name', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/friends')
      .set(auth())
      .send({ name: '  Bob  ', color: 'oklch(0.74 0.14 65)' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Bob');
  });
});

// ---------------------------------------------------------------------------
// PATCH /friends/:id
// ---------------------------------------------------------------------------

describe('PATCH /friends/:id', () => {
  test('returns 404 when friend does not belong to user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch('/friends/unknown-id')
      .set(auth())
      .send({ name: 'New Name' });

    expect(res.status).toBe(404);
  });

  test('updates and returns the friend', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [FRIEND_ROW] })                        // SELECT existing
      .mockResolvedValueOnce({ rows: [] })                                  // UPDATE
      .mockResolvedValueOnce({ rows: [{ ...FRIEND_ROW, name: 'Alicia' }] }); // SELECT updated

    const res = await request(app)
      .patch('/friends/friend-1')
      .set(auth())
      .send({ name: 'Alicia' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alicia');
  });
});

// ---------------------------------------------------------------------------
// DELETE /friends/:id
// ---------------------------------------------------------------------------

describe('DELETE /friends/:id', () => {
  test('returns 404 when friend does not belong to user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/friends/unknown-id')
      .set(auth());

    expect(res.status).toBe(404);
  });

  test('deletes the friend and returns deleted: true', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 'friend-1' }] }) // SELECT
      .mockResolvedValueOnce({ rows: [] });                  // DELETE

    const res = await request(app)
      .delete('/friends/friend-1')
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
