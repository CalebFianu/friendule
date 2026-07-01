const request = require('supertest');
const { signToken } = require('../middleware/auth');

jest.mock('../db', () => ({ pool: { query: jest.fn() } }));

// Capture stable mock function references inside the factory (runs before hoisting resolves)
jest.mock('groq-sdk', () => {
  const create = jest.fn();
  const MockGroq = jest.fn(() => ({ chat: { completions: { create } } }));
  MockGroq._mockCreate = create;
  return MockGroq;
});

jest.mock('@anthropic-ai/sdk', () => {
  const create = jest.fn();
  const MockAnthropic = jest.fn(() => ({ messages: { create } }));
  MockAnthropic._mockCreate = create;
  return { default: MockAnthropic };
});

const Groq = require('groq-sdk');
const { default: Anthropic } = require('@anthropic-ai/sdk');
const app = require('../app');

const groqCreate = Groq._mockCreate;
const claudeCreate = Anthropic._mockCreate;

const USER_ID = 'test-user-id';
let token;

beforeAll(() => { token = signToken(USER_ID); });
beforeEach(() => jest.clearAllMocks());

const auth = () => ({ Authorization: `Bearer ${token}` });

// ---------------------------------------------------------------------------
// Shared response fixtures
// ---------------------------------------------------------------------------

function groqResponse(content) {
  return { choices: [{ message: { content: JSON.stringify(content) } }] };
}

function claudeResponse(content) {
  return { content: [{ text: JSON.stringify(content) }] };
}

const CREATE_PAYLOAD = {
  intent: 'create',
  rules: [{
    title: 'Work', status: 'busy', recurrence: 'weekly',
    weekdays: [1, 2, 3, 4, 5], all_day: false, time_start: '09:00', time_end: '17:00',
  }],
  clarification_needed: null,
};

const DELETE_PAYLOAD = {
  intent: 'delete',
  delete_filter: { all: false, title_keywords: ['gym'], status: 'any', recurrence: 'any', weekdays: null, date: null },
  clarification_needed: null,
};

const UPDATE_PAYLOAD = {
  intent: 'update',
  update_filter: { title_keywords: ['work'], status: 'any', recurrence: 'any', weekdays: null, date: null },
  update_fields: { timeStart: '10:00', timeEnd: '18:00', title: null, status: null, allDay: null, recurrence: null, weekdays: null, date: null },
  clarification_needed: null,
};

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

describe('POST /parse — input validation', () => {
  test('returns 400 when text is missing', async () => {
    const res = await request(app).post('/parse').set(auth()).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/text is required/i);
  });

  test('returns 400 when text is blank', async () => {
    const res = await request(app).post('/parse').set(auth()).send({ text: '   ' });
    expect(res.status).toBe(400);
  });

  test('returns 401 with no token', async () => {
    const res = await request(app).post('/parse').send({ text: 'busy weekdays' });
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Groq primary path
// ---------------------------------------------------------------------------

describe('POST /parse — Groq primary path', () => {
  test('uses Groq and returns parsed create rules', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(CREATE_PAYLOAD));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'busy weekdays 9-5' });

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe('create');
    expect(res.body.rules).toHaveLength(1);
    expect(res.body.rules[0].title).toBe('Work');
    expect(claudeCreate).not.toHaveBeenCalled();
  });

  test('returns delete intent from Groq', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(DELETE_PAYLOAD));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'remove gym' });

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe('delete');
    expect(res.body.delete_filter.title_keywords).toEqual(['gym']);
    expect(claudeCreate).not.toHaveBeenCalled();
  });

  test('returns update intent from Groq', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(UPDATE_PAYLOAD));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'change work to 10-6' });

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe('update');
    expect(res.body.update_fields.timeStart).toBe('10:00');
    expect(claudeCreate).not.toHaveBeenCalled();
  });

  test('returns clarification_needed when LLM is unsure', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse({
      intent: 'create',
      rules: [],
      clarification_needed: 'What time does your gym session start?',
    }));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'gym' });

    expect(res.status).toBe(200);
    expect(res.body.clarification_needed).toBe('What time does your gym session start?');
  });
});

// ---------------------------------------------------------------------------
// Claude fallback path
// ---------------------------------------------------------------------------

describe('POST /parse — Claude fallback', () => {
  test('falls back to Claude when Groq throws', async () => {
    groqCreate.mockRejectedValueOnce(new Error('Service unavailable'));
    claudeCreate.mockResolvedValueOnce(claudeResponse(CREATE_PAYLOAD));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'busy weekdays 9-5' });

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe('create');
    expect(res.body.rules).toHaveLength(1);
    expect(claudeCreate).toHaveBeenCalledTimes(1);
  });

  test('returns 500 when both Groq and Claude fail', async () => {
    groqCreate.mockRejectedValueOnce(new Error('Groq down'));
    claudeCreate.mockRejectedValueOnce(new Error('Claude down'));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'busy weekdays 9-5' });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/LLM request failed/i);
  });

  test('returns 502 when fallback Claude response is not valid JSON', async () => {
    groqCreate.mockRejectedValueOnce(new Error('Groq down'));
    claudeCreate.mockResolvedValueOnce({ content: [{ text: 'not json at all' }] });

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'busy weekdays 9-5' });

    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/failed to parse/i);
  });
});

// ---------------------------------------------------------------------------
// Field normalisation
// ---------------------------------------------------------------------------

describe('POST /parse — field normalisation', () => {
  test('normalises all_day → allDay and time_start/time_end → timeStart/timeEnd', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse({
      intent: 'create',
      rules: [{ title: 'Gym', status: 'busy', recurrence: 'once', date: '2026-08-01', all_day: true, time_start: null, time_end: null }],
      clarification_needed: null,
    }));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'gym on August 1st all day' });

    expect(res.status).toBe(200);
    expect(res.body.rules[0].allDay).toBe(true);
    expect(res.body.rules[0].timeStart).toBeNull();
  });
});
