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
  is_self: false,
  created_at: 1000000,
};

// Personal calendar friend — auto-created once per user, is_self: true
const PERSONAL_ROW = {
  id: 'personal-1',
  name: 'Me',
  color: 'oklch(0.65 0.15 260)',
  description: '',
  timezone: 'UTC',
  is_self: true,
  created_at: 999999,
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
// GET /friends — personal friend auto-creation
// ---------------------------------------------------------------------------

describe('GET /friends — personal friend auto-creation', () => {
  test('does not insert when a personal friend already exists', async () => {
    pool.query.mockResolvedValueOnce({ rows: [PERSONAL_ROW, FRIEND_ROW] });

    const res = await request(app).get('/friends').set(auth());

    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test('auto-creates personal friend when no is_self record exists', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [FRIEND_ROW] })               // initial SELECT — no is_self
      .mockResolvedValueOnce({ rows: [] })                          // INSERT personal friend
      .mockResolvedValueOnce({ rows: [PERSONAL_ROW, FRIEND_ROW] }); // re-SELECT

    const res = await request(app).get('/friends').set(auth());

    expect(res.status).toBe(200);
    expect(res.body.friends).toHaveLength(2);
    expect(pool.query).toHaveBeenCalledTimes(3);
  });

  test('auto-creates personal friend when user has no friends at all', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })             // initial SELECT — empty
      .mockResolvedValueOnce({ rows: [] })              // INSERT
      .mockResolvedValueOnce({ rows: [PERSONAL_ROW] }); // re-SELECT

    const res = await request(app).get('/friends').set(auth());

    expect(res.status).toBe(200);
    expect(res.body.friends).toHaveLength(1);
    expect(pool.query).toHaveBeenCalledTimes(3);
  });

  test('INSERT for personal friend includes is_self = true', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [PERSONAL_ROW] });

    await request(app).get('/friends').set(auth());

    const insertCall = pool.query.mock.calls[1];
    expect(insertCall[0]).toMatch(/is_self/i);
    expect(insertCall[1]).toContain(true); // the is_self value
  });
});

// ---------------------------------------------------------------------------
// GET /friends — response shape
// ---------------------------------------------------------------------------

describe('GET /friends — response shape', () => {
  test('returns friends list with isSelf field', async () => {
    pool.query.mockResolvedValueOnce({ rows: [PERSONAL_ROW, FRIEND_ROW] });

    const res = await request(app).get('/friends').set(auth());

    expect(res.status).toBe(200);
    expect(res.body.friends).toHaveLength(2);
    res.body.friends.forEach(f => expect(f).toHaveProperty('isSelf'));
  });

  test('personal friend has isSelf: true', async () => {
    pool.query.mockResolvedValueOnce({ rows: [PERSONAL_ROW, FRIEND_ROW] });

    const res = await request(app).get('/friends').set(auth());

    const personal = res.body.friends.find(f => f.isSelf === true);
    expect(personal).toBeDefined();
    expect(personal.name).toBe('Me');
  });

  test('regular friends have isSelf: false', async () => {
    pool.query.mockResolvedValueOnce({ rows: [PERSONAL_ROW, FRIEND_ROW] });

    const res = await request(app).get('/friends').set(auth());

    const regular = res.body.friends.find(f => f.name === 'Alice');
    expect(regular).toBeDefined();
    expect(regular.isSelf).toBe(false);
  });

  test('returns only personal friend when no regular friends have been added', async () => {
    pool.query.mockResolvedValueOnce({ rows: [PERSONAL_ROW] });

    const res = await request(app).get('/friends').set(auth());

    expect(res.status).toBe(200);
    expect(res.body.friends).toHaveLength(1);
    expect(res.body.friends[0].isSelf).toBe(true);
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

  test('pickColor query excludes personal (is_self) friends', async () => {
    // No color provided — triggers pickColor
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // pickColor SELECT
      .mockResolvedValueOnce({ rows: [] }); // INSERT

    const res = await request(app)
      .post('/friends')
      .set(auth())
      .send({ name: 'Carol' });

    expect(res.status).toBe(201);
    const pickColorCall = pool.query.mock.calls[0];
    expect(pickColorCall[0]).toMatch(/is_self\s*=\s*false/i);
    expect(pickColorCall[1]).toContain(USER_ID);
  });

  test('created friend has isSelf: false', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/friends')
      .set(auth())
      .send({ name: 'Dave', color: 'oklch(0.70 0.12 155)' });

    expect(res.status).toBe(201);
    expect(res.body.isSelf).toBe(false);
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
