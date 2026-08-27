# Plan 005: Restrict CORS to the known frontend origin

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 3bc5ec2..HEAD -- backend/app.js backend/server.js`
> If either file changed, compare the "Current state" excerpts against the live
> code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `3bc5ec2`, 2026-07-21

## Why this matters

`app.use(cors())` with no options defaults to `Access-Control-Allow-Origin: *`,
which means any webpage on any domain can make requests to the API and read the
responses. While the JWT-based auth (Bearer token in `Authorization` header)
prevents actual account takeover via a CORS-based attack, the wildcard ACAO is
still a misconfiguration:

- It signals to browsers that API responses are public, which they aren't.
- If cookie-based auth is ever added alongside JWT (e.g. for the Google OAuth
  flow in `plan.md`), the wildcard would immediately enable CSRF.
- Security scanners flag it.

`FRONTEND_ORIGIN` is already read in `server.js` (line 5) but is never passed
to the `cors()` call in `app.js`. This plan wires them together.

## Current state

```js
// backend/server.js:4-5
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
```

`FRONTEND_ORIGIN` is only used in a `console.log` on line 11; it is not passed
to `app.js` or to the `cors` middleware.

```js
// backend/app.js:1-31 (full file)
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { authMiddleware } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const friendsRoutes = require('./routes/friends');
const eventsRoutes = require('./routes/events');
const rulesRoutes = require('./routes/rules');
const parseRoutes = require('./routes/parse');
const transcribeRoutes = require('./routes/transcribe');

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/friends', authMiddleware, friendsRoutes);
app.use('/events', authMiddleware, eventsRoutes);
app.use('/rules', authMiddleware, rulesRoutes);
app.use('/parse', authMiddleware, parseRoutes);
app.use('/transcribe', authMiddleware, transcribeRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

module.exports = app;
```

The default frontend dev server runs on port **5173** (Vite default), not 3000.
The existing fallback `'http://localhost:3000'` is already wrong for the current
stack. The correct local fallback is `'http://localhost:5173'`.

## Commands you will need

| Purpose | Command                    | Expected on success   |
|---------|----------------------------|-----------------------|
| Tests   | `cd backend && npm test`   | all pass              |

## Scope

**In scope** (the only files you should modify):
- `backend/app.js` — accept the allowed origin as a parameter and use it in `cors()`
- `backend/server.js` — pass `FRONTEND_ORIGIN` when calling the app factory,
  and correct the default from `3000` to `5173`

**Out of scope** (do NOT touch):
- Any route file
- Any frontend file
- `backend/__tests__/` — tests import `app.js` directly without a `FRONTEND_ORIGIN`
  argument; the implementation must keep this working (see Step 1)

## Git workflow

- Branch: `advisor/005-cors-restrict`
- Commit message style: match repo convention:
  `"restrict CORS to FRONTEND_ORIGIN instead of wildcard"`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Make `app.js` accept an optional `origin` parameter

The test suite imports `app.js` as `require('../app')` with no arguments. The
change must not break that. Use a module-level env-var read as the default so
`app.js` works standalone (as tests use it) while `server.js` can override it.

Replace line 15 (`app.use(cors())`) in `backend/app.js`:

```js
// BEFORE
app.use(cors());
```

```js
// AFTER — reads FRONTEND_ORIGIN from the environment; server.js can also
// set it before requiring this module. Tests run without it and get the
// env-var fallback (which is fine — they don't test CORS headers).
const CORS_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CORS_ORIGIN }));
```

Place the `const CORS_ORIGIN` line immediately before `app.use(cors(...))`.

**Verify**:
```
grep -n 'cors' backend/app.js
```
Expected: two lines — the `require('cors')` import and the `app.use(cors({...}))` call.
The bare `app.use(cors())` line must not appear.

### Step 2: Correct the `FRONTEND_ORIGIN` default in `server.js`

In `backend/server.js` line 5, change the fallback from `3000` to `5173`
(Vite's default port):

```js
// BEFORE
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// AFTER
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
```

`server.js` logs `FRONTEND_ORIGIN` on startup (`console.log(\`CORS origin: ${FRONTEND_ORIGIN}\`)`).
With this change, the logged value matches what `app.js` now uses when
`FRONTEND_ORIGIN` is not set in the environment.

**Verify**: `grep 'localhost:' backend/server.js` → only `5173` appears (no `3000`).

### Step 3: Run the backend tests

```
cd backend && npm test
```

All tests must pass. The CORS change does not affect response bodies — only the
`Access-Control-Allow-Origin` header — and no existing test asserts on that header.

**Verify**: all test suites report `PASS`, zero failures.

### Step 4: Manual smoke test (optional but recommended)

Start the backend (`node backend/server.js`) and send a cross-origin preflight:

```
curl -s -I -X OPTIONS http://localhost:4000/health \
  -H "Origin: http://evil.example.com" \
  -H "Access-Control-Request-Method: GET"
```

Expected: response does **not** include `Access-Control-Allow-Origin: http://evil.example.com`
(and does not include `Access-Control-Allow-Origin: *`).

```
curl -s -I -X OPTIONS http://localhost:4000/health \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
```

Expected: response includes `Access-Control-Allow-Origin: http://localhost:5173`.

## Test plan

No new automated tests are needed — CORS header behaviour is infrastructure-level
and best verified with the curl smoke tests in Step 4. If a future testing pass
adds HTTP-header assertions to the supertest suite, `Access-Control-Allow-Origin`
should be asserted for `/health` as part of that effort.

## Done criteria

- [ ] `cd backend && npm test` exits 0, all tests pass
- [ ] `grep 'cors()' backend/app.js` returns no matches (bare wildcard call is gone)
- [ ] `grep 'localhost:3000' backend/server.js` returns no matches
- [ ] `grep 'localhost:5173' backend/server.js` returns one match (the default)
- [ ] Smoke test: `Origin: http://evil.example.com` does not appear in response headers
- [ ] Smoke test: `Origin: http://localhost:5173` gets reflected in `ACAO` header
- [ ] Only `backend/app.js` and `backend/server.js` are modified (`git status`)
- [ ] `plans/README.md` status row updated to DONE

## STOP conditions

- Any test in `backend/__tests__/` asserts on `Access-Control-Allow-Origin`
  and fails after this change (check the test output; if so, stop and report
  the failing assertion — the test may need updating separately).
- `backend/app.js` contents differ significantly from the "Current state" excerpt
  (drift since plan was written).
- You discover the `cors` package version installed doesn't support the `origin`
  option (`cors` has supported it since v1.x; confirm with `grep '"cors"'
  backend/package.json`).

## Maintenance notes

- When deploying, set `FRONTEND_ORIGIN` to the exact production URL of the
  frontend (e.g. `https://friendule.app`). The `cors` package does exact-string
  matching on the `origin` option when given a string — no wildcards.
- If multiple frontend origins need to be allowed (e.g. staging + production),
  change `CORS_ORIGIN` to an array: `process.env.FRONTEND_ORIGIN?.split(',') || [...]`.
- When the Google Calendar OAuth callback route is added (`plan.md`), its
  redirect lands on the backend (not the frontend), so it is not affected by
  this CORS restriction. However, any new frontend-initiated API endpoints
  must be accessible from the allowed origin — this is automatically handled
  since the single `app.use(cors(...))` applies globally.
- The `/health` endpoint is also now CORS-restricted. If an external monitoring
  service pings it from a different origin, it will get blocked. Either whitelist
  that origin or serve `/health` before the `cors()` middleware (move it above
  `app.use(cors(...))`) — do this in a follow-up if needed.
