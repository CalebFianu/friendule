# Plan 001: Replace hardcoded API_BASE with a Vite environment variable

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 3bc5ec2..HEAD -- src/hooks/useFriendule.js .env.example vite.config.js`
> If any of those files changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx / tech-debt
- **Planned at**: commit `3bc5ec2`, 2026-07-21

## Why this matters

`API_BASE` is hardcoded to `http://localhost:4000` in the main hook. Any deployment
beyond a local machine requires editing source code. Vite exposes environment
variables prefixed with `VITE_` via `import.meta.env`, which is the standard
pattern for this. Adding an `.env.example` also documents the variable for future
contributors (including the Google Calendar integration planned in `plan.md`).

## Current state

- `src/hooks/useFriendule.js` — root hook holding all app state and API calls.
  The hardcoded constant is on line 6:

  ```js
  // src/hooks/useFriendule.js:6
  const API_BASE = 'http://localhost:4000';
  ```

  `API_BASE` is referenced throughout the file only as `API_BASE + path` inside
  the `apiFetch` helper at line 90:

  ```js
  // src/hooks/useFriendule.js:88-95
  const apiFetch = useCallback(async (path, options = {}) => {
    const token = auth?.token;
    const res = await fetch(API_BASE + path, {
  ```

  No other file imports or declares `API_BASE`.

- `vite.config.js` — current contents (no env config needed, Vite reads
  `.env` files automatically):

  ```js
  // vite.config.js (full file)
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
  })
  ```

- No `.env` or `.env.example` files exist in the project root.

Convention: Vite automatically loads `.env` / `.env.local` files and exposes
`VITE_*` variables via `import.meta.env`. The fallback keeps localhost working
with zero config for local dev.

## Commands you will need

| Purpose | Command                     | Expected on success      |
|---------|-----------------------------|--------------------------|
| Lint    | `npm run lint`              | exit 0, no warnings      |
| Dev build check | `npm run build`   | exit 0, no errors        |

(Run from the repo root.)

## Scope

**In scope** (the only files you should create or modify):
- `src/hooks/useFriendule.js` — change line 6 only
- `.env.example` — create this file in the repo root
- `.gitignore` — verify `.env` is already ignored (do not add `.env.example`)

**Out of scope** (do NOT touch):
- `vite.config.js` — no changes needed; Vite reads env files automatically
- `backend/` — the backend port is `process.env.PORT`, already handled
- Any other frontend file

## Git workflow

- Branch: `advisor/001-api-base-env-var`
- Commit message style: match repo convention (plain description, no prefix):
  `"use VITE_API_BASE env var instead of hardcoded localhost URL"`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Create `.env.example` in the repo root

Create the file `C:\Users\Caleb\Desktop\Projects\Friendule\.env.example` with
this exact content:

```
# URL of the backend API server.
# Copy this file to .env.local and set the value for your environment.
VITE_API_BASE=http://localhost:4000
```

**Verify**: `cat .env.example` → file exists and contains `VITE_API_BASE=http://localhost:4000`.

### Step 2: Confirm `.env` is in `.gitignore`

Read `.gitignore` and check that `.env` (or `.env.*`) is listed so that a
local `.env.local` file is never committed.

Current `.gitignore` already contains:
```
.env
```

If `.env` is not there, add it. Do NOT add `.env.example` to `.gitignore` —
example files are meant to be committed.

**Verify**: `grep -n '\.env' .gitignore` → at least one matching line.

### Step 3: Update `API_BASE` in `useFriendule.js`

In `src/hooks/useFriendule.js`, replace line 6:

```js
// OLD — line 6
const API_BASE = 'http://localhost:4000';
```

with:

```js
// NEW — line 6
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
```

No other change is needed in this file. `API_BASE` is consumed correctly
everywhere it's already used.

**Verify**: `grep -n 'API_BASE' src/hooks/useFriendule.js` → two lines:
the definition (line 6) and the usage inside `apiFetch` (~line 90). The definition
should now read `import.meta.env.VITE_API_BASE || 'http://localhost:4000'`.

### Step 4: Lint and build

```
npm run lint
npm run build
```

Both must exit 0 with no errors.

## Test plan

No automated tests exist for this file. Manual verification:

1. Start backend (`cd backend && node server.js`).
2. Run `npm run dev`.
3. Open the app in a browser — login/register should work as before (the
   fallback keeps `http://localhost:4000` active).
4. Create a `.env.local` file with `VITE_API_BASE=http://localhost:4000` and
   restart `npm run dev` — app should still work identically (the env var
   overrides now).

## Done criteria

- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep 'localhost:4000' src/hooks/useFriendule.js` returns exactly one line
      (the fallback in the `||` expression, not a bare string)
- [ ] `.env.example` exists and contains `VITE_API_BASE=http://localhost:4000`
- [ ] `git status` shows only: `src/hooks/useFriendule.js`, `.env.example`, and
      optionally `.gitignore` — no other modified files
- [ ] `plans/README.md` status row updated to DONE

## STOP conditions

- The definition of `API_BASE` in `useFriendule.js` has already been changed
  (drift since this plan was written — check with the reviewer).
- `npm run build` fails with an `import.meta.env` error (unusual for Vite —
  stop and report the error message).
- Any file other than the three listed in Scope needs to be changed.

## Maintenance notes

- When deploying to a real server, set `VITE_API_BASE` to the production backend
  URL in the CI/CD environment or a server-side `.env` file.
- The fallback `http://localhost:4000` is fine for local dev and means no
  `.env.local` is required to get started.
- When the Google Calendar OAuth redirect is implemented (`plan.md`), its
  callback URL is backend-only and not affected by this variable.
