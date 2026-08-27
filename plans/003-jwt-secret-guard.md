# Plan 003: Add a startup guard that fails fast when JWT_SECRET is not set

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 3bc5ec2..HEAD -- backend/middleware/auth.js backend/server.js`
> If either file changed, compare the "Current state" excerpts against the live
> code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `3bc5ec2`, 2026-07-21

## Why this matters

The auth middleware falls back to the literal string `'dev-secret-change-me'`
when `JWT_SECRET` is not set:

```js
// backend/middleware/auth.js:3
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
```

If someone deploys the backend without setting `JWT_SECRET`, the server starts
silently and all JWTs are signed with a publicly known secret. An attacker who
knows (or guesses) the fallback can forge valid tokens for any `userId`. The
server gives no warning — the operator has no indication anything is wrong.

The fix adds a startup check in `server.js` that calls `process.exit(1)` with a
clear error message when `JWT_SECRET` is absent. This converts a silent
misconfiguration into an immediate, obvious deployment failure.

## Current state

```js
// backend/middleware/auth.js:1-24 (full file)
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { authMiddleware, signToken };
```

```js
// backend/server.js:1-17 (full file)
const app = require('./app');
const { init: initDb } = require('./db');

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Friendule API running on http://localhost:${PORT}`);
      console.log(`CORS origin: ${FRONTEND_ORIGIN}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  });
```

**Test setup note**: The backend tests (`backend/__tests__/auth.test.js` etc.) do
NOT start `server.js` — they import `app.js` directly via `require('../app')`.
The startup guard lives in `server.js` and therefore does not interfere with the
test suite.

## Commands you will need

| Purpose | Command                    | Expected on success              |
|---------|----------------------------|----------------------------------|
| Tests   | `cd backend && npm test`   | all pass                         |

## Scope

**In scope** (the only files you should modify):
- `backend/server.js` — add the startup guard before `initDb()` is called

**Out of scope** (do NOT touch):
- `backend/middleware/auth.js` — the fallback stays in place for local dev
  (developers who don't set `JWT_SECRET` still get a working server locally
  because the guard is only a warning in dev mode; see Step 1)
- Any route file or test file

## Git workflow

- Branch: `advisor/003-jwt-secret-guard`
- Commit message style: match repo convention:
  `"exit at startup if JWT_SECRET env var is not set in production"`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add the startup guard to `backend/server.js`

Add a check **before** the `initDb()` call. The behaviour differs by environment
so that local development without a `.env` file still works:

- In `production` (`NODE_ENV === 'production'`): fatal — exit 1 with a clear error.
- In any other environment (dev, test): warn but continue (uses the fallback secret).

Replace the current `server.js` with:

```js
const app = require('./app');
const { init: initDb } = require('./db');

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// Guard: JWT_SECRET must be explicitly set in production.
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start in production.');
    process.exit(1);
  } else {
    console.warn('WARNING: JWT_SECRET is not set. Using insecure fallback — set JWT_SECRET before deploying.');
  }
}

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Friendule API running on http://localhost:${PORT}`);
      console.log(`CORS origin: ${FRONTEND_ORIGIN}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  });
```

**Verify**:
```
node -e "require('./backend/server.js')" 2>&1 | head -5
```
Expected (when `JWT_SECRET` is not set and `NODE_ENV` is not `production`):
a line containing `WARNING: JWT_SECRET is not set`.

To test the production path without affecting your environment:
```
NODE_ENV=production node -e "process.env.JWT_SECRET=''; require('./backend/server.js')" 2>&1; echo "exit: $?"
```
Expected: output containing `FATAL: JWT_SECRET` and `exit: 1`.

### Step 2: Run the full backend test suite

```
cd backend && npm test
```

All tests must pass. The tests import `app.js`, not `server.js`, so the guard
does not run during tests.

**Verify**: all test suites report `PASS`, zero failures.

## Test plan

The guard lives in `server.js` which is intentionally not imported in tests.
No automated test is added for the guard itself (it would require mocking
`process.exit`, which adds fragility for trivial benefit). Manual verification
is the done criterion for this guard (the `node -e` commands in Step 1).

## Done criteria

- [ ] `cd backend && npm test` exits 0, all tests pass
- [ ] Running `NODE_ENV=production node backend/server.js` without `JWT_SECRET`
      set prints `FATAL:` and exits with code 1
- [ ] Running `node backend/server.js` without `JWT_SECRET` (dev mode) prints
      `WARNING:` and continues to start
- [ ] `git diff 3bc5ec2 -- backend/middleware/auth.js` shows no changes
      (auth.js is untouched)
- [ ] Only `backend/server.js` is modified (`git status`)
- [ ] `plans/README.md` status row updated to DONE

## STOP conditions

- Any test in `backend/__tests__/` imports `server.js` directly (they shouldn't —
  all current tests import `app.js` — but verify before proceeding; if any test
  does import `server.js` the guard will interfere with it).
- The `server.js` contents differ significantly from the excerpt above
  (drift since this plan was written).

## Maintenance notes

- When a proper `.env` / secret-management system is added (e.g. AWS Secrets
  Manager, Doppler), this guard remains correct — `JWT_SECRET` just gets set
  from that system before server start.
- If `NODE_ENV` is ever set to `production` in a local dev environment, this
  guard will require `JWT_SECRET` to be set there too. That's the intended
  behaviour — the guard protects the production path.
- `ANTHROPIC_API_KEY` and `GROQ_API_KEY` could get similar guards in a follow-up;
  they aren't covered here to keep scope minimal.
