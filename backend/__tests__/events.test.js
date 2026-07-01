const request = require('supertest');
const app = require('../app');
const { signToken } = require('../middleware/auth');

jest.mock('../db', () => ({ pool: { query: jest.fn() } }));

const { pool } = require('../db');

const USER_ID = 'test-user-id';
const FRIEND_ID = 'friend-1';
const EVENT_ID = 'event-1';
let token;

beforeAll(() => { token = signToken(USER_ID); });
beforeEach(() => jest.clearAllMocks());

const auth = () => ({ Authorization: `Bearer ${token}` });

const EVENT_ROW = {
  id: EVENT_ID,
  friend_id: FRIEND_ID,
  type: 'single',
  title: 'Coffee',
  status: 'busy',
  all_day: true,
  start_min: null,
  end_min: null,
  date: '2026-08-15',
  weekdays: null,
  created_at: 1000000,
};

const SINGLE_BODY = {
  friendId: FRIEND_ID,
  type: 'single',
  title: 'Coffee',
  status: 'busy',
  allDay: true,
  date: '2026-08-15',
};

const WEEKLY_BODY = {
  friendId: FRIEND_ID,
  type: 'weekly',
  title: 'Gym',
  status: 'busy',
  allDay: false,
  startMin: 420,
  endMin: 480,
  weekdays: [1, 3, 5],
};

// ---------------------------------------------------------------------------
// GET /events
// ---------------------------------------------------------------------------

describe('GET /events', () => {
  test('returns all events for the authenticated user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [EVENT_ROW] });

    const res = await request(app).get('/events').set(auth());

    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0].title).toBe('Coffee');
  });

  test('filters by friendId query param', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get(`/events?friendId=${FRIEND_ID}`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('friend_id'),
      expect.arrayContaining([USER_ID, FRIEND_ID])
    );
  });
});

// ---------------------------------------------------------------------------
// POST /events — validation
// ---------------------------------------------------------------------------

describe('POST /events — validation', () => {
  test('returns 400 when friendId is missing', async () => {
    const res = await request(app)
      .post('/events')
      .set(auth())
      .send({ type: 'single', title: 'Coffee', status: 'busy', allDay: true, date: '2026-08-15' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/friendId/i);
  });

  test('returns 400 for invalid type', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] });

    const res = await request(app)
      .post('/events')
      .set(auth())
      .send({ ...SINGLE_BODY, type: 'monthly' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/type/i);
  });

  test('returns 400 for invalid status', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] });

    const res = await request(app)
      .post('/events')
      .set(auth())
      .send({ ...SINGLE_BODY, status: 'together' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/status/i);
  });

  test('returns 400 when single event is missing date', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] });

    const res = await request(app)
      .post('/events')
      .set(auth())
      .send({ ...SINGLE_BODY, date: undefined });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/date/i);
  });

  test('returns 400 when weekly event has no weekdays', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] });

    const res = await request(app)
      .post('/events')
      .set(auth())
      .send({ ...WEEKLY_BODY, weekdays: [] });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/weekdays/i);
  });

  test('returns 400 when timed event is missing startMin', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] });

    const res = await request(app)
      .post('/events')
      .set(auth())
      .send({ ...WEEKLY_BODY, startMin: undefined });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/startMin/i);
  });
});

// ---------------------------------------------------------------------------
// POST /events — success
// ---------------------------------------------------------------------------

describe('POST /events — success', () => {
  test('creates a single all-day event and returns 201', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [EVENT_ROW] });

    const res = await request(app)
      .post('/events')
      .set(auth())
      .send(SINGLE_BODY);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Coffee');
    expect(res.body.date).toBe('2026-08-15');
  });

  test('creates a timed weekly event and returns 201', async () => {
    const weeklyRow = { ...EVENT_ROW, type: 'weekly', title: 'Gym', date: null, weekdays: [1, 3, 5], all_day: false, start_min: 420, end_min: 480 };

    pool.query
      .mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [weeklyRow] });

    const res = await request(app)
      .post('/events')
      .set(auth())
      .send(WEEKLY_BODY);

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('weekly');
    expect(res.body.weekdays).toEqual([1, 3, 5]);
  });
});

// ---------------------------------------------------------------------------
// PUT /events/:id
// ---------------------------------------------------------------------------

describe('PUT /events/:id', () => {
  test('returns 404 when event does not belong to user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/events/unknown-event')
      .set(auth())
      .send(SINGLE_BODY);

    expect(res.status).toBe(404);
  });

  test('updates and returns the event', async () => {
    const updatedRow = { ...EVENT_ROW, title: 'Lunch' };

    pool.query
      .mockResolvedValueOnce({ rows: [{ id: EVENT_ID }] })
      .mockResolvedValueOnce({ rows: [{ id: FRIEND_ID }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [updatedRow] });

    const res = await request(app)
      .put(`/events/${EVENT_ID}`)
      .set(auth())
      .send({ ...SINGLE_BODY, title: 'Lunch' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Lunch');
  });
});

// ---------------------------------------------------------------------------
// DELETE /events/:id
// ---------------------------------------------------------------------------

describe('DELETE /events/:id', () => {
  test('returns 404 when event does not belong to user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/events/unknown-event')
      .set(auth());

    expect(res.status).toBe(404);
  });

  test('deletes the event and returns deleted: true', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: EVENT_ID }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete(`/events/${EVENT_ID}`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
