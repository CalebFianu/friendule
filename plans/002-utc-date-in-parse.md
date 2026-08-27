# Plan 002: Fix "today" date computed in UTC instead of the user's timezone

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 3bc5ec2..HEAD -- backend/routes/parse.js src/hooks/useFriendule.js`
> If either file changed, compare the "Current state" excerpts against the live
> code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug / correctness
- **Planned at**: commit `3bc5ec2`, 2026-07-21

## Why this matters

The LLM system prompt includes today's date and weekday name so it can resolve
phrases like "today", "tomorrow", "this Saturday", and "next week". Currently,
`today` is computed on the server using `new Date().toISOString()`, which is
always UTC. A user in UTC−5 at 8pm local time will have `today` set to
tomorrow's UTC date — every date-relative phrase they type resolves to the wrong
calendar day. This affects all users outside UTC.

The fix passes the browser's IANA timezone from the frontend to the backend, and
the backend computes `today` in that timezone using the native `Intl` API
(no new dependencies).

## Current state

**Backend — where the bug is:**

```js
// backend/routes/parse.js:123-131
router.post('/', async (req, res) => {
  const { text, existingRules } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required.' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = dayNames[new Date().getDay()];
```

Both `today` (ISO date) and `todayDay` (weekday name) are computed in UTC.

**Frontend — where to add the timezone field:**

```js
// src/hooks/useFriendule.js:1-8 (top of file)
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ymd, parseYmd, addDays, hhmm } from '../utils/dateUtils';
import { expandRules, getViewerZone } from '../utils/ruleExpander';
import { PALETTE, makeColorset } from '../utils/seedData';

const API_BASE = 'http://localhost:4000';
const VIEWER_ZONE = getViewerZone();
```

`VIEWER_ZONE` is already computed at module level using `getViewerZone()`.

```js
// src/utils/ruleExpander.js:127-129
export function getViewerZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
```

`VIEWER_ZONE` already holds the user's IANA timezone string (e.g. `"America/New_York"`).

**The parse request body — where `timezone` needs to be added:**

```js
// src/hooks/useFriendule.js:296-312
const data = await apiFetch('/parse', {
  method: 'POST',
  body: JSON.stringify({
    text,
    existingRules: friendRules.map(r => ({
      title: r.title,
      status: r.status,
      recurrence: r.recurrence,
      weekdays: r.weekdays,
      date: r.date,
      timeStart: r.timeStart,
      timeEnd: r.timeEnd,
      allDay: r.allDay,
    })),
  }),
});
```

## Commands you will need

| Purpose | Command                                | Expected on success     |
|---------|----------------------------------------|-------------------------|
| Lint    | `npm run lint`                         | exit 0                  |
| Tests   | `cd backend && npm test -- parse`      | all pass                |

## Scope

**In scope** (the only files you should modify):
- `backend/routes/parse.js` — accept `timezone`, compute `today`/`todayDay` in that zone
- `src/hooks/useFriendule.js` — add `timezone: VIEWER_ZONE` to the parse request body

**Out of scope** (do NOT touch):
- `src/utils/ruleExpander.js` — `getViewerZone()` is already correct; no change needed
- `backend/__tests__/parse.test.js` — update test mocks only if the test currently
  asserts on the exact date string (check first; if it doesn't, leave it)
- Any other file

## Git workflow

- Branch: `advisor/002-utc-date-parse`
- Commit message style: match repo convention:
  `"fix today's date computed in UTC instead of user's timezone in parse route"`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add `timezone` to the frontend parse request

In `src/hooks/useFriendule.js`, find the `/parse` request body (around line 296-312,
inside `commitPrompt`). Add `timezone: VIEWER_ZONE` to the JSON body:

```js
// BEFORE
body: JSON.stringify({
  text,
  existingRules: friendRules.map(r => ({
    ...
  })),
}),

// AFTER — add timezone field
body: JSON.stringify({
  text,
  timezone: VIEWER_ZONE,
  existingRules: friendRules.map(r => ({
    ...
  })),
}),
```

`VIEWER_ZONE` is already in scope at the module level (line 7). Do not import
anything new.

**Verify**: `grep -n 'VIEWER_ZONE' src/hooks/useFriendule.js` → two lines:
the module-level declaration and the new `timezone:` line.

### Step 2: Update the backend to accept and use `timezone`

In `backend/routes/parse.js`, update the route handler to:

1. Destructure `timezone` from `req.body`
2. Validate and sanitise it (any unknown timezone string must not crash the server)
3. Compute `today` and `todayDay` in the user's timezone using `Intl`

Replace lines 123-131:

```js
// BEFORE
router.post('/', async (req, res) => {
  const { text, existingRules } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required.' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = dayNames[new Date().getDay()];
```

with:

```js
// AFTER
router.post('/', async (req, res) => {
  const { text, existingRules, timezone } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required.' });
  }

  // Determine the user's local date in their timezone.
  // Fall back to UTC if the timezone string is missing or invalid.
  let tz = 'UTC';
  if (typeof timezone === 'string' && timezone.trim()) {
    try {
      // Intl throws a RangeError for unrecognised timezone identifiers.
      Intl.DateTimeFormat(undefined, { timeZone: timezone.trim() });
      tz = timezone.trim();
    } catch {
      // invalid timezone string — use UTC
    }
  }
  const now = new Date();
  // 'sv-SE' locale formats dates as YYYY-MM-DD, which is what the prompt needs.
  const today = now.toLocaleDateString('sv-SE', { timeZone: tz });
  const todayDay = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long' });
```

The rest of the handler (lines 132 onward) is unchanged.

**Verify**:
```
grep -n 'timezone' backend/routes/parse.js
```
Should show: the destructure line and the two lines that use `tz`.

```
grep -n 'toISOString\|new Date().getDay' backend/routes/parse.js
```
Should return **no matches** — the old UTC calls are gone.

### Step 3: Run the backend tests

```
cd backend && npm test -- parse
```

All existing parse tests should pass. They mock `Groq`/`Anthropic` and don't
assert on the exact value of `today` in the system prompt, so they should not
need updating. If a test fails because it asserts on the exact prompt string,
update that assertion to accept any valid ISO date — but do not change test
intent.

### Step 4: Lint the frontend

```
npm run lint
```

Expected: exit 0, no errors.

## Test plan

No unit test currently covers the timezone-aware `today` computation. After this
plan lands, add one test to `backend/__tests__/parse.test.js`:

- **Test name**: `"uses provided timezone to determine today's date"`
- **What it does**: POST `/parse` with `{ text: "I'm free today", timezone: "Pacific/Auckland" }`.
  Mock Groq to return a valid `create` response. Assert that the system prompt
  passed to Groq contains today's date in Pacific/Auckland time (not UTC).
  The easiest assertion: capture the `systemPrompt` argument from the Groq mock
  and assert `systemPrompt.includes(expectedDate)` where `expectedDate` is
  computed with `new Date().toLocaleDateString('sv-SE', { timeZone: 'Pacific/Auckland' })`.

Pattern: model after the existing parse tests (`backend/__tests__/parse.test.js`)
which already mock `groq-sdk` using `jest.mock`.

## Done criteria

- [ ] `npm run lint` exits 0
- [ ] `cd backend && npm test` exits 0, all tests pass
- [ ] `grep 'toISOString\|getDay' backend/routes/parse.js` returns no matches
- [ ] `grep 'timezone: VIEWER_ZONE' src/hooks/useFriendule.js` returns one match
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated to DONE

## STOP conditions

- The backend does not have `Intl` available (Node.js ≥ 13 has full ICU by
  default; if `node --version` is older than 13, stop and report).
- A parse test asserts on the exact date string in the system prompt in a way
  that makes it impossible to update without changing test intent — stop and
  report what the assertion says.
- Any step requires touching a file outside the scope list.

## Maintenance notes

- If the backend is ever moved to an environment that strips ICU data (some
  minimal Docker images do), `toLocaleDateString` with a non-UTC timezone may
  silently return a wrong result. Add `--icu-data-dir` or use a full-ICU Node
  build in that case.
- The `'sv-SE'` locale trick for ISO date formatting is a known stable idiom in
  Node.js but relies on locale data. If it ever breaks, the fallback is:
  ```js
  const d = new Date(); const parts = new Intl.DateTimeFormat('en-CA', {timeZone:tz}).format(d); // also YYYY-MM-DD
  ```
- When the Google Calendar integration (`plan.md`) is implemented, the OAuth
  flow will also need timezone awareness for event timestamps — this fix doesn't
  address that, but the same `VIEWER_ZONE` variable can be reused.
