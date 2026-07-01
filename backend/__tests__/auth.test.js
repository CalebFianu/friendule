const request = require('supertest');
const app = require('../app');

jest.mock('../db', () => ({ pool: { query: jest.fn() } }));
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

const { pool } = require('../db');
const bcrypt = require('bcrypt');

beforeEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------

describe('POST /auth/register', () => {
  test('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/valid email/i);
  });

  test('returns 400 for password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/6 characters/i);
  });

  test('returns 409 when email is already registered', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'taken@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test('returns 201 with a token on success', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })   // email not taken
      .mockResolvedValueOnce({ rows: [] });  // INSERT

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'new@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('new@example.com');
  });

  test('normalises email to lowercase', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'User@Example.COM', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('user@example.com');
  });
});

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------

describe('POST /auth/login', () => {
  test('returns 400 when email or password is missing', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(400);
  });

  test('returns 401 for unknown email', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/incorrect/i);
  });

  test('returns 401 for wrong password', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 'uid', email: 'user@example.com', password_hash: 'hashed' }],
    });
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/incorrect/i);
  });

  test('returns 200 with a token on success', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 'uid', email: 'user@example.com', password_hash: 'hashed' }],
    });
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.id).toBe('uid');
  });
});
