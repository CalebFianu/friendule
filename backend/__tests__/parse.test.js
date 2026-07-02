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

const CREATE_ONCE_TODAY_PAYLOAD = {
  intent: 'create',
  rules: [{
    title: 'Work',
    status: 'busy',
    recurrence: 'once',
    date: new Date().toISOString().slice(0, 10),
    all_day: false,
    time_start: '09:00',
    time_end: '17:00',
  }],
  clarification_needed: null,
};

const DELETE_PAYLOAD = {
  intent: 'delete',
  delete_filter: { all: false, title_keywords: ['gym'], status: 'any', recurrence: 'any', weekdays: null, date: null },
  clarification_needed: null,
};

const DELETE_BY_DATE_PAYLOAD = {
  intent: 'delete',
  delete_filter: {
    all: false,
    date: new Date().toISOString().slice(0, 10),
    status: 'any',
    recurrence: null,
    weekdays: null,
    title_keywords: null,
  },
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

  test('passes through a once rule with today\'s date unchanged', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(CREATE_ONCE_TODAY_PAYLOAD));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'working today' });

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe('create');
    const rule = res.body.rules[0];
    expect(rule.recurrence).toBe('once');
    expect(rule.date).toBe(new Date().toISOString().slice(0, 10));
  });
});

// ---------------------------------------------------------------------------
// System prompt content — "today" and delete-by-date instructions
// ---------------------------------------------------------------------------

describe('POST /parse — system prompt instructions', () => {
  test('system prompt contains CRITICAL instruction: "today" must produce once recurrence', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(CREATE_PAYLOAD));

    await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'working today' });

    const systemPrompt = groqCreate.mock.calls[0][0].messages[0].content;
    expect(systemPrompt).toMatch(/CRITICAL/);
    expect(systemPrompt).toMatch(/today.*once/i);
  });

  test('system prompt contains CRITICAL instruction: "tomorrow" must produce once recurrence', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(CREATE_PAYLOAD));

    await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'busy tomorrow' });

    const systemPrompt = groqCreate.mock.calls[0][0].messages[0].content;
    expect(systemPrompt).toMatch(/tomorrow.*once/i);
  });

  test('system prompt tells LLM not to set recurrence in date-based delete filters', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(DELETE_PAYLOAD));

    await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'clear today' });

    const systemPrompt = groqCreate.mock.calls[0][0].messages[0].content;
    expect(systemPrompt).toMatch(/clear today/i);
    expect(systemPrompt).toMatch(/do not set recurrence/i);
  });

  test('system prompt includes today\'s date', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(CREATE_PAYLOAD));

    await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'test' });

    const today = new Date().toISOString().slice(0, 10);
    const systemPrompt = groqCreate.mock.calls[0][0].messages[0].content;
    expect(systemPrompt).toContain(today);
  });

  test('system prompt includes existing rules context when provided', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(CREATE_PAYLOAD));

    await request(app)
      .post('/parse')
      .set(auth())
      .send({
        text: 'remove gym',
        existingRules: [{
          title: 'Gym',
          status: 'busy',
          recurrence: 'weekly',
          weekdays: [1, 3],
          timeStart: '07:00',
          timeEnd: '08:00',
          allDay: false,
          date: null,
        }],
      });

    const systemPrompt = groqCreate.mock.calls[0][0].messages[0].content;
    expect(systemPrompt).toMatch(/gym/i);
    expect(systemPrompt).not.toMatch(/no existing rules/i);
  });
});

// ---------------------------------------------------------------------------
// Delete intent — date-based filter
// ---------------------------------------------------------------------------

describe('POST /parse — date-based delete filter', () => {
  test('passes through delete filter with date and no recurrence', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(DELETE_BY_DATE_PAYLOAD));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'clear my schedule for today' });

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe('delete');
    expect(res.body.delete_filter.date).toBe(new Date().toISOString().slice(0, 10));
    expect(res.body.delete_filter.recurrence).toBeNull();
  });

  test('passes through delete filter with title keywords unchanged', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse(DELETE_PAYLOAD));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'remove gym' });

    expect(res.status).toBe(200);
    expect(res.body.delete_filter.title_keywords).toEqual(['gym']);
    expect(res.body.delete_filter.date).toBeNull();
  });

  test('returns 502 when delete intent has no delete_filter', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse({ intent: 'delete' }));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'remove everything' });

    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/invalid delete structure/i);
  });
});

// ---------------------------------------------------------------------------
// Together status in create rules
// ---------------------------------------------------------------------------

describe('POST /parse — together status', () => {
  test('passes through together-status rules from LLM', async () => {
    groqCreate.mockResolvedValueOnce(groqResponse({
      intent: 'create',
      rules: [{
        title: 'Dinner',
        status: 'together',
        recurrence: 'once',
        date: '2026-08-05',
        all_day: false,
        time_start: '19:00',
        time_end: '21:00',
      }],
      clarification_needed: null,
    }));

    const res = await request(app)
      .post('/parse')
      .set(auth())
      .send({ text: 'dinner together on August 5th 7-9pm' });

    expect(res.status).toBe(200);
    expect(res.body.rules[0].status).toBe('together');
    expect(res.body.rules[0].title).toBe('Dinner');
    expect(res.body.rules[0].timeStart).toBe('19:00');
  });
});
