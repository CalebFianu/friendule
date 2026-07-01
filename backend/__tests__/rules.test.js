const request = require('supertest');
const app = require('../app');
const { signToken } = require('../middleware/auth');

jest.mock('../db', () => ({ pool: { query: jest.fn() } }));

const { pool } = require('../db');

const USER_ID = 'test-user-id';
const FRIEND_ID = 'friend-1';
const RULE_ID = 'rule-1';
let token;

beforeAll(() => { token = signToken(USER_ID); });
beforeEach(() => jest.clearAllMocks());

const auth = () => ({ Authorization: `Bearer ${token}` });

const RULE_ROW = {
  id: RULE_ID,
  friend_id: FRIEND_ID,
  title: 'Work',
  status: 'busy',
  recurrence: 'weekly',
  all_day: false,
  time_start: '09:00',
  time_end: '17:00',
  date: null,
  weekdays: [1, 2, 3, 4, 5],
  raw_text: 'busy weekdays 9-5',
  created_at: 1000000,
};

const ONCE_RULE_ROW = {
  id: RULE_ID,
  friend_id: FRIEND_ID,
  title: 'Dentist',
  status: 'busy',
  recurrence: 'once',
  all_day: true,
  time_start: null,
  time_end: null,
  date: '2026-08-01',
  weekdays: null,
  raw_text: '',
  created_at: 1000000,
};

const WEEKLY_BODY = {
  friendId: FRIEND_ID,
  title: 'Work',
  status: 'busy',
  recurrence: 'weekly',
  allDay: false,
  timeStart: '09:00',
  timeEnd: '17:00',
  weekdays: [1, 2, 3, 4, 5],
};

const ONCE_BODY = {
  friendId: FRIEND_ID,
  title: 'Dentist',
  status: 'busy',
  recurrence: 'once',
  allDay: true,
  date: '2026-08-01',
};

// ---------------------------------------------------------------------------
// GET /rules
// ---------------------------------------------------------------------------

describe('GET /rules', () => {
  test('returns all rules for the authenticated user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [RULE_ROW] });

    const res = await request(app).get('/rules').set(auth());

    expect(res.status).toBe(200);
    expect(res.body.rules).toHaveLength(1);
    expect(res.body.rules[0].title).toBe('Work');
  });

  test('filters by friendId when query param is provided', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get(`/rules?friendId=${FRIEND_ID}`)
      .set(auth());

    expect(res.status).toBe(200);
    // Verify the query included the friendId filter
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('friend_id'),
      expect.arrayContaining([USER_ID, FRIEND_ID])
    );
  });
});

// ---------------------------------------------------------------------------
// POST /rules — validation
// ---------------------------------------------------------------------------

describe('POST /rules — validation', () => {
  test('returns 400 when friendId is missing', async () => {
    const res = await request(app)
      .post('/rules')
      .set(auth())
      .send({ title: 'Work', status: 'busy', recurrence: 'weekly', weekdays: [1], timeStart: '09:00', timeEnd: '17:00' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/friendId/i);
  });

  test('returns 400 when friend does not belong to user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // friend not found

    const res = await request(app)
      .post('/rules')
      .set(auth())
      .send({ ...WEEKLY_BODY, friendId: 'not-my-friend' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/friend not found/i);
  });

  test('returns 400 for invalid recurrence value', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] });

    const res = await request(app)
      .post('/rules')
      .set(auth())
      .send({ ...WEEKLY_BODY, recurrence: 'monthly' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/recurrence/i);
  });

  test('returns 400 for invalid status value', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] });

    const res = await request(app)
      .post('/rules')
      .set(auth())
      .send({ ...WEEKLY_BODY, status: 'maybe' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/status/i);
  });

  test('returns 400 when weekly rule has no weekdays', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] });

    const res = await request(app)
      .post('/rules')
      .set(auth())
      .send({ ...WEEKLY_BODY, weekdays: [] });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/weekdays/i);
  });

  test('returns 400 when once rule is missing date', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] });

    const res = await request(app)
      .post('/rules')
      .set(auth())
      .send({ ...ONCE_BODY, date: undefined });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/date/i);
  });

  test('returns 400 when timed rule is missing timeStart', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] });

    const res = await request(app)
      .post('/rules')
      .set(auth())
      .send({ ...WEEKLY_BODY, timeStart: undefined });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/timeStart/i);
  });
});

// ---------------------------------------------------------------------------
// POST /rules — success cases
// ---------------------------------------------------------------------------

describe('POST /rules — success', () => {
  test('creates a weekly rule and returns 201', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] }) // validateRule: friend exists
      .mockResolvedValueOnce({ rows: [] })                  // INSERT
      .mockResolvedValueOnce({ rows: [RULE_ROW] });         // SELECT created rule

    const res = await request(app)
      .post('/rules')
      .set(auth())
      .send(WEEKLY_BODY);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Work');
    expect(res.body.recurrence).toBe('weekly');
    expect(res.body.weekdays).toEqual([1, 2, 3, 4, 5]);
  });

  test('creates an all-day once rule and returns 201', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [ONCE_RULE_ROW] });

    const res = await request(app)
      .post('/rules')
      .set(auth())
      .send(ONCE_BODY);

    expect(res.status).toBe(201);
    expect(res.body.recurrence).toBe('once');
    expect(res.body.allDay).toBe(true);
    expect(res.body.date).toBe('2026-08-01');
  });
});

// ---------------------------------------------------------------------------
// PUT /rules/:id
// ---------------------------------------------------------------------------

describe('PUT /rules/:id', () => {
  test('returns 404 when rule does not belong to user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/rules/unknown-rule')
      .set(auth())
      .send(WEEKLY_BODY);

    expect(res.status).toBe(404);
  });

  test('updates and returns the rule', async () => {
    const updatedRow = { ...RULE_ROW, title: 'Deep Work' };

    pool.query
      .mockResolvedValueOnce({ rows: [{ id: RULE_ID }] })    // SELECT existing rule
      .mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] })  // validateRule: friend exists
      .mockResolvedValueOnce({ rows: [] })                   // UPDATE
      .mockResolvedValueOnce({ rows: [updatedRow] });        // SELECT updated rule

    const res = await request(app)
      .put(`/rules/${RULE_ID}`)
      .set(auth())
      .send({ ...WEEKLY_BODY, title: 'Deep Work' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Deep Work');
  });
});

// ---------------------------------------------------------------------------
// DELETE /rules/:id
// ---------------------------------------------------------------------------

describe('DELETE /rules/:id', () => {
  test('returns 404 when rule does not belong to user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/rules/unknown-rule')
      .set(auth());

    expect(res.status).toBe(404);
  });

  test('deletes the rule and returns deleted: true', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: RULE_ID }] }) // SELECT
      .mockResolvedValueOnce({ rows: [] });               // DELETE

    const res = await request(app)
      .delete(`/rules/${RULE_ID}`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
