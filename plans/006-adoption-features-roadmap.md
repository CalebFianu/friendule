# Plan 006: Adoption Features Roadmap

> **Executor instructions**: This is a phased roadmap. Pick one feature at a time,
> read its full section before starting, and update the status table in
> `plans/README.md` when done. Each feature section includes its own scope,
> files, and done criteria. Implement phases in order unless a feature is
> explicitly marked as independent.
>
> **Drift check (run first for any feature):**
> `git diff --stat HEAD -- src/hooks/useFriendule.js src/App.jsx backend/db.js`
> Compare "Current state" notes against live code before proceeding.

## Status

- **Priority**: P1 (Phase 1), P2 (Phase 2–4)
- **Effort**: varies per feature (see table below)
- **Risk**: LOW–MEDIUM
- **Depends on**: none (Phase 1 features are independent of each other)
- **Planned at**: commit `58097ef`, 2026-07-28

## Execution order & status

| # | Feature | Phase | Effort | Depends on | Status |
|---|---------|-------|--------|------------|--------|
| 6a | [Demo / Guest Mode](#feature-6a-demo--guest-mode) | 1 | M | — | TODO |
| 6b | [iCal Import](#feature-6b-ical-import) | 1 | M | — | TODO |
| 6c | [Find a Time Tool](#feature-6c-find-a-time-tool) | 1 | M | — | TODO |
| 6d | [Weekly Digest Email](#feature-6d-weekly-digest-email) | 2 | L | — | TODO |
| 6e | [Friend Request System](#feature-6e-friend-request-system) | 2 | XL | — | TODO |
| 6f | [AI Parse Preview](#feature-6f-ai-parse-preview) | 3 | S | — | TODO |
| 6g | [Undo for AI Actions](#feature-6g-undo-for-ai-actions) | 3 | S | — | TODO |
| 6h | [Schedule Templates](#feature-6h-schedule-templates) | 3 | S | — | TODO |
| 6i | [Shareable Availability Link](#feature-6i-shareable-availability-link) | 3 | L | — | TODO |
| 6j | [Shared Hangouts](#feature-6j-shared-hangouts--proposed-events) | 3 | L | 6e | TODO |
| 6k | [Guided First-Run Flow](#feature-6k-guided-first-run-flow) | 4 | M | — | TODO |

## Dependency notes

- **6e must precede 6j**: Hangout invites rely on the `linked_user_id` system introduced by friend requests.
- **6f enhances 6a**: Implementing AI Parse Preview (6f) before Demo Mode (6a) means demo-mode AI interactions use the better UX out of the box. Not a hard dependency.
- **6f, 6g, 6h, 6i, 6k** are fully independent — can be done in any order or in parallel branches.
- All Phase 1 features (6a, 6b, 6c) are independent of each other.

---

## Feature 6a: Demo / Guest Mode

### Why this matters

Registration friction is the single largest adoption barrier. A guest mode lets users experience the full app with realistic data before committing to an account. On sign-up, they can optionally carry their demo session forward.

### Approach

Purely client-side — no backend session, no DB writes. Auth state is replaced with a sentinel `{ demo: true }`. All mutation functions branch on `isDemo` and update local state directly instead of calling the API. On registration from demo, `promoteDemoData(token)` bulk-POSTs the in-memory friends and rules using the new JWT.

### Files to create

| File | Purpose |
|------|---------|
| `src/components/DemoBanner.jsx` | Sticky top banner: "You're in demo mode. Sign up to save your data." with dismiss and "Save my data" buttons |

### Files to modify

**`src/utils/seedData.js`**

Add a `buildDemoState()` export that returns `{ friends, rules }` fully hydrated (with `makeColorset`, `isSelf: false`, `createdAt: Date.now()`). This centralises the shape so the hook and any tests agree.

```js
export function buildDemoState() {
  const friends = DEFAULT_FRIENDS.map(f => ({
    ...f, isSelf: false, description: f.status, createdAt: Date.now(),
  }));
  const rules = buildSeedRules();
  return { friends, rules };
}
```

**`src/hooks/useFriendule.js`**

- Add state: `const [isDemo, setIsDemo] = useState(localStorage.getItem('friendule_demo') === 'true')`
- Add `enterDemo()`: set sentinel auth, seed friends+rules from `buildDemoState()`, write `localStorage.friendule_demo = 'true'`
- Add `exitDemo()`: clear demo state and localStorage key, reset auth/friends/rules to null
- Add `promoteDemoData(token)`: bulk-POST in-memory friends then rules using the new JWT; called from `submitAuth` when user registers from demo with "Import my data" checked
- Gate every mutation function (`saveNewFriend`, `saveNewRule`, `deleteRule`, `deleteEvent`, etc.):
  ```js
  if (isDemo) { /* mutate state directly */ return; }
  ```
- Expose: `isDemo, enterDemo, exitDemo`

**`src/components/LandingPage.jsx`**

Add `enterDemo` prop. Add ghost-link button below the hero CTAs:
```jsx
<button onClick={enterDemo}>Try it without signing up →</button>
```
Mirror the same button in the bottom CTA section.

**`src/components/AuthScreen.jsx`**

When `isDemo && authMode === 'register'`, show a default-checked checkbox:
```
[x] Import my demo data into this account
```
Pass `keepDemoData` boolean into `submitAuth`.

**`src/App.jsx`**

```jsx
{state.isDemo && <DemoBanner onSignup={() => state.setAuthMode('register')} onExit={state.exitDemo} />}
```

### Database changes

None.

### Implementation order

1. Add `buildDemoState()` to `seedData.js`
2. Add `isDemo`, `enterDemo`, `exitDemo`, `promoteDemoData` to `useFriendule.js`
3. Gate all mutation functions
4. Create `DemoBanner.jsx`
5. Wire "Try it" button into `LandingPage.jsx`
6. Add import-data checkbox to register flow in `AuthScreen.jsx`

### Done criteria

- [ ] Clicking "Try it without signing up" loads the app with demo friends and rules, no network requests
- [ ] All mutations (add rule, delete rule, add friend) work in demo mode without hitting the API
- [ ] `DemoBanner` is visible throughout demo session
- [ ] Registering from demo with checkbox checked results in demo data appearing in the new account
- [ ] `localStorage.friendule_demo` is cleared after registration or `exitDemo()`

---

## Feature 6b: iCal Import

### Why this matters

Manual data entry is the largest cost of using Friendule. If users can import their real calendar in one step, the AI parsing becomes a supplement rather than the sole entry method.

### Approach

File upload (`.ics`) in the friends tab → raw text sent to `POST /import/ical` → backend parses VEVENTs using pure JS (no ICS library needed) → returns an array of rule preview objects → `ICalPreviewModal` shows checkboxes → confirmed rules go through existing `POST /rules`.

The endpoint is **read-only** — it only transforms, never saves. This keeps the preview–confirm flow entirely in the frontend.

### Files to create

**`backend/routes/ical.js`**

Pure parser + route handler. Key functions:

```js
function parseIcs(text)           // splits into VEVENT blocks
function parseDtValue(dtStr)      // '20260714T090000Z' → { date, time, isAllDay }
function parseRrule(rruleStr)     // 'FREQ=WEEKLY;BYDAY=MO,WE' → { weekdays: [1,3] }
function veventToRule(vevent, friendId) // maps one VEVENT → Friendule rule shape, or null
```

**ICS field mapping:**

| ICS field | Friendule field | Notes |
|-----------|----------------|-------|
| `SUMMARY` | `title` | Trimmed, max 60 chars |
| `DTSTART` / `DTEND` with time | `timeStart` / `timeEnd` | `HH:MM` |
| `DTSTART` date-only (no `T`) | `allDay: true` | |
| `RRULE:FREQ=WEEKLY;BYDAY=...` | `recurrence: 'weekly'`, `weekdays` | `MO→1, TU→2, WE→3, TH→4, FR→5, SA→6, SU→0` |
| `RRULE:FREQ=DAILY` | `recurrence: 'daily'` | |
| No RRULE | `recurrence: 'once'`, `date` from DTSTART | |
| `RRULE:UNTIL=...` | `dateTo` | |
| `STATUS:FREE` or `TRANSP:TRANSPARENT` | `status: 'free'` | Default → `'busy'` |
| Missing `DTSTART` | Return `null` (skip) | |

Route:
```
POST /import/ical
Authorization: Bearer <token>
Body:     { icsText: string, friendId: string }
Response: { rules: RuleShape[], skipped: number }
```

**`src/components/ICalPreviewModal.jsx`**

Props: `{ preview: { rules, skipped, friendId } | null, friendName, onConfirm, onCancel }`

- Header: "Import from iCal — N events found for [friendName] (M skipped)"
- Scrollable list of rule cards — title, status badge, recurrence summary, optional date
- Checkbox per card (all checked by default) + "Deselect all" link
- Footer: "Import X selected" / "Cancel"

### Files to modify

**`backend/server.js`**

```js
const icalRoutes = require('./routes/ical');
app.use('/import', authMiddleware, icalRoutes);
```

**`src/hooks/useFriendule.js`**

- Add state: `const [icalPreview, setIcalPreview] = useState(null)`
- Add `importIcal(file, friendId)`: reads file text, POSTs to `/import/ical`, sets `icalPreview`
- Add `confirmIcalImport(selectedRules)`: iterates selected rules, POSTs each to `/rules`, updates `rules` state, calls `pushAction`, flashes toast
- Expose: `icalPreview, importIcal, confirmIcalImport, closeIcalPreview: () => setIcalPreview(null)`

**`src/App.jsx`**

```jsx
<ICalPreviewModal
  preview={state.icalPreview}
  friendName={...}
  onConfirm={state.confirmIcalImport}
  onCancel={state.closeIcalPreview}
/>
```

**`src/components/FriendSwitcher.jsx`** (or the friend header area in the friends tab)

Add hidden `<input type="file" accept=".ics" style={{ display: 'none' }}>` and a visible "Import .ics" button that programmatically clicks it. On change: call `importIcal(e.target.files[0], friend.id)`.

### Database changes

None at import time. Rules use the existing `rules` table via `POST /rules`.

### Implementation order

1. Write and test `backend/routes/ical.js` parser functions with a sample `.ics` string
2. Register route in `backend/server.js`
3. Add `importIcal` + `confirmIcalImport` to `useFriendule.js`
4. Create `ICalPreviewModal.jsx`
5. Add file input trigger to the friends tab
6. Wire modal into `App.jsx`

### Done criteria

- [ ] Uploading a standard Google Calendar export `.ics` populates the preview modal
- [ ] Recurring events parse into `weekly` rules with correct `weekdays`
- [ ] Single events parse into `once` rules with correct `date`
- [ ] VEVENTs with missing `DTSTART` are counted in `skipped`, not shown
- [ ] Unchecking a card excludes that rule from the import
- [ ] Confirmed rules appear on the calendar without a page reload

---

## Feature 6c: Find a Time Tool

### Why this matters

EveryoneView already shows who's busy on each day, but makes the user do the mental work of spotting a free window. "Find a time" closes the loop by surfacing exact time slots where all selected friends are free for a requested duration.

### Approach

Entirely frontend — no new API endpoints. A new utility `src/utils/findTime.js` uses the existing `expandRules` engine to collect busy intervals per friend per day, inverts them to free intervals, intersects across all friends, and filters by minimum duration. A score rates each window by breathing room (gap to the nearest busy block). Results appear in `FindTimeModal`, and each result has a "Book it" button that pre-fills `EventEditor`.

### Files to create

**`src/utils/findTime.js`**

```js
/**
 * findMeetingWindows
 * @param {Array<{ friend, rules[] }>} friendsWithRules
 * @param {number} durationMinutes   minimum window length
 * @param {number} daysAhead         days to scan (default 14)
 * @param {string} viewerZone        IANA timezone of the viewer
 * @returns {Array<{ date, startMin, endMin, durationMin, score }>}
 */
export function findMeetingWindows(friendsWithRules, durationMinutes, daysAhead = 14, viewerZone) { ... }

// Returns sorted [startMin, endMin][] for all busy events on a given date
function getBusyIntervals(expandedEvents, date) { ... }

// Returns free intervals within [dayStart, dayEnd] not covered by busyIntervals
function invertIntervals(busyIntervals, dayStart = 0, dayEnd = 1439) { ... }

// Returns intervals free in ALL N lists
function intersectIntervalLists(lists) { ... }

// Score = average gap (minutes) to nearest busy block on either side; higher = better
function scoreWindow(startMin, endMin, allBusyIntervals) { ... }
```

**`src/components/FindTimeModal.jsx`**

Props: `{ modal, friends, onClose, onBook, onSearch }`

- Header: "Find a time"
- Controls row: duration selector (30 min / 1 hr / 2 hr / custom input), "Search" button
- Results list: date (pretty), time range, "Book it" button per result
- Empty state: "No windows found in the next 14 days. Try a shorter duration."
- "Book it" calls `onBook({ date, startMin, endMin })` which opens `EventEditor` pre-filled

### Files to modify

**`src/hooks/useFriendule.js`**

- Add state: `const [findTimeModal, setFindTimeModal] = useState(null)`
  - Shape: `{ friendIds, results, loading, durationMinutes }`
- Add `openFindTime()`: initialises modal with `everyoneFilter` (or all regular friends)
- Add `runFindTime(friendIds, durationMinutes, daysAhead = 14)`: calls `findMeetingWindows`, updates modal with results
- Add `bookFindTimeSlot({ date, startMin, endMin })`: closes find-time modal, calls `openNew(date, startMin, endMin)`
- Extend `openNew(dateYmd, startMin, endMin?)`: use `endMin` when provided instead of `startMin + 60`
- Expose: `findTimeModal, openFindTime, runFindTime, bookFindTimeSlot, closeFindTime: () => setFindTimeModal(null)`

**`src/components/EveryoneView.jsx`**

Add `openFindTime` to props. Add "Find a time" button to the title row:
```jsx
<button onClick={openFindTime}>Find a time</button>
```

**`src/App.jsx`**

```jsx
<FindTimeModal
  modal={state.findTimeModal}
  friends={state.regularFriends}
  onClose={state.closeFindTime}
  onBook={state.bookFindTimeSlot}
  onSearch={state.runFindTime}
/>
```

Pass `openFindTime={state.openFindTime}` to `EveryoneView`.

### Database changes

None.

### API endpoints

None.

### Implementation order

1. Write `src/utils/findTime.js` — implement all four helper functions independently before wiring up
2. Add state + functions to `useFriendule.js`
3. Extend `openNew` to accept optional `endMin`
4. Create `FindTimeModal.jsx`
5. Add "Find a time" button to `EveryoneView.jsx`
6. Wire modal into `App.jsx`

### Done criteria

- [ ] "Find a time" button appears in `EveryoneView` title bar
- [ ] With two friends who are both busy Mon–Fri 9–5, results show only weekend slots or evenings
- [ ] Selecting 2-hour duration filters out windows shorter than 120 minutes
- [ ] "Book it" opens `EventEditor` pre-filled with the correct date, start, and end time
- [ ] Empty state message appears when no windows exist in range

---

## Feature 6d: Weekly Digest Email

### Why this matters

Passive value delivery: users receive a summary of when they and their friends are free this week without having to open the app. Keeps Friendule top-of-mind and drives re-engagement.

### Approach

A `node-cron` job runs every Monday at 8am (server time), finds opted-in users, computes their group's free windows for the coming week using a server-side port of the `expandRules` logic, and sends a plain-text email via Nodemailer. Users can opt out and choose a different digest day from a settings panel.

### Files to create

| File | Purpose |
|------|---------|
| `backend/digest/engine.js` | Server-side free-window computation (Luxon-based, mirrors `findTime.js`) |
| `backend/digest/sender.js` | Nodemailer setup + `sendDigest(toEmail, subject, body)` |
| `backend/digest/cron.js` | `node-cron` schedule; exports `startDigestCron(pool)` |
| `backend/routes/digest.js` | `GET /digest/preview`, `POST /digest/send` |
| `src/components/UserSettingsModal.jsx` | Digest opt-in toggle + day picker |

### Files to modify

**`backend/db.js`**

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS digest_opt_in BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS digest_day    INT     NOT NULL DEFAULT 1;
```

**`backend/routes/auth.js`**

Add `PATCH /auth/settings`:
```
Body:     { digestOptIn?: boolean, digestDay?: number }
Response: { ok: true }
```

**`backend/server.js`**

```js
const { startDigestCron } = require('./digest/cron');
initDb().then(() => {
  startDigestCron(pool);
  app.listen(...);
});
```

Register digest routes:
```js
const digestRoutes = require('./routes/digest');
app.use('/digest', authMiddleware, digestRoutes);
```

**`src/hooks/useFriendule.js`**

- Add `userSettings` state (fetched on login via `GET /auth/settings`)
- Add `settingsModal` boolean state
- Add `updateSettings(patch)` → `PATCH /auth/settings`
- Expose: `userSettings, settingsModal, openSettings, closeSettings, updateSettings`

**`src/components/Header.jsx`**

Add settings gear icon that calls `openSettings`.

**`src/App.jsx`**

```jsx
<UserSettingsModal
  open={state.settingsModal}
  settings={state.userSettings}
  onSave={state.updateSettings}
  onClose={state.closeSettings}
/>
```

### Database changes

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS digest_opt_in BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS digest_day    INT     NOT NULL DEFAULT 1;
```

### API endpoints

```
GET  /digest/preview
Response: { windows: [{ date, startMin, endMin, friendNames: string[] }] }

POST /digest/send
Response: { sent: true }

PATCH /auth/settings
Body:     { digestOptIn?: boolean, digestDay?: number }
Response: { ok: true }
```

### New dependencies

```bash
cd backend && npm install node-cron nodemailer
```

### New environment variables

```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=hello@friendule.app
```

### Implementation order

1. DB migration in `db.js`
2. `PATCH /auth/settings` in `auth.js`
3. `backend/digest/engine.js`
4. `backend/digest/sender.js`
5. `backend/digest/cron.js`
6. `backend/routes/digest.js`
7. Wire cron into `server.js`
8. `UserSettingsModal.jsx` frontend
9. Gear icon in `Header.jsx`

### Done criteria

- [ ] `POST /digest/send` triggers an email to the authenticated user
- [ ] Email body lists days this week when selected friends share free time
- [ ] Users with `digest_opt_in = false` are skipped by the cron
- [ ] Settings modal shows toggle and day picker; changes persist via `PATCH /auth/settings`
- [ ] Missing SMTP env vars cause a startup warning, not a crash

---

## Feature 6e: Friend Request System

### Why this matters

Currently, schedule data is siloed per user. A friend request system lets two real users share their actual availability with each other — turning Friendule from a personal tracker into a genuinely social calendar.

### Approach

Users send requests by email. When accepted, both users get a shadow `friends` entry with `linked_user_id` pointing at the real user. `GET /rules` is modified to also return rules for linked friends (read-only). Writes on linked-friend rules are rejected 403.

### Files to create

| File | Purpose |
|------|---------|
| `backend/routes/friendRequests.js` | Send / list / accept / decline endpoints |
| `src/components/FriendRequestModal.jsx` | Email input + pending-requests list |
| `src/components/FriendRequestBadge.jsx` | Header notification dot |

### Files to modify

**`backend/db.js`**

```sql
CREATE TABLE IF NOT EXISTS friend_requests (
  id           TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL REFERENCES users(id),
  to_user_id   TEXT NOT NULL REFERENCES users(id),
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK(status IN ('pending','accepted','declined')),
  created_at   BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_freq_to   ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_freq_from ON friend_requests(from_user_id);

ALTER TABLE friends ADD COLUMN IF NOT EXISTS linked_user_id TEXT REFERENCES users(id);
```

**`backend/routes/rules.js`**

Modify `GET /rules` to also return linked-friend rules:
```sql
SELECT r.* FROM rules r
JOIN friends f ON r.friend_id = f.id
WHERE f.owner_id = $1
   OR (f.linked_user_id IS NOT NULL
       AND r.owner_id = f.linked_user_id
       AND r.friend_id IN (
         SELECT id FROM friends WHERE owner_id = f.linked_user_id AND is_self = true
       ))
ORDER BY r.created_at ASC
```

Add ownership check to `PUT /rules/:id` and `DELETE /rules/:id`: reject with 403 if `owner_id != userId`.

**`backend/routes/friendRequests.js`** — on `PATCH /:id` with `status: 'accepted'`:
- Create shadow friend entry in requester's friends table (`linked_user_id = responder's userId`)
- Create shadow friend entry in responder's friends table (`linked_user_id = requester's userId`)
- Use the linked user's name and timezone as defaults for the shadow entry

**`backend/server.js`**

```js
const frRoutes = require('./routes/friendRequests');
app.use('/friend-requests', authMiddleware, frRoutes);
```

**`src/hooks/useFriendule.js`**

- Add `friendRequests` state
- Add `fetchFriendRequests()`, `sendFriendRequest(email)`, `respondToRequest(id, status)`
- Include `fetchFriendRequests()` in the initial `Promise.all` on login
- Expose: `friendRequests, sendFriendRequest, respondToRequest, friendRequestModal, openFriendRequestModal, closeFriendRequestModal`

**`src/components/Header.jsx`**

Add `FriendRequestBadge` when `pendingRequests.length > 0`. Clicking opens `FriendRequestModal`.

### Database changes

```sql
CREATE TABLE IF NOT EXISTS friend_requests (
  id TEXT PRIMARY KEY, from_user_id TEXT NOT NULL REFERENCES users(id),
  to_user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined')),
  created_at BIGINT NOT NULL
);
ALTER TABLE friends ADD COLUMN IF NOT EXISTS linked_user_id TEXT REFERENCES users(id);
```

### API endpoints

```
POST /friend-requests
Body:     { email: string }
Response: { request: { id, fromUserId, toUserId, status, createdAt } }
Errors:   400 (bad email), 404 (user not found), 409 (already exists)

GET /friend-requests
Response: {
  incoming: [{ id, fromEmail, createdAt }],
  outgoing: [{ id, toEmail, status, createdAt }]
}

PATCH /friend-requests/:id
Body:     { status: 'accepted' | 'declined' }
Response: { request: { id, status } }
Side effect on 'accepted': creates linked friend entries in both users' tables
```

### Implementation order

1. DB migration
2. `backend/routes/friendRequests.js`
3. Modify `GET /rules` in `rules.js` + add 403 guard to write routes
4. `FriendRequestModal.jsx` + `FriendRequestBadge.jsx`
5. `useFriendule.js` additions
6. `Header.jsx` badge

### Done criteria

- [ ] User A sends a request to User B's email; B sees it in their incoming list
- [ ] B accepts; both users now see each other's rules in their calendar
- [ ] User A cannot `PUT` or `DELETE` a rule that belongs to User B (403)
- [ ] Declining a request removes it from both users' lists
- [ ] Header badge shows count of pending incoming requests

---

## Feature 6f: AI Parse Preview

### Why this matters

Currently the AI parses text and saves rules immediately, with no chance to review. A preview step removes fear of accidental data changes and builds trust in the AI input method.

### Approach

In `commitPrompt`, after the LLM returns `intent: 'create'`, pause and populate `parsePreview` state instead of immediately saving. A modal shows editable rule cards. The user confirms (or cancels) before anything hits the API.

### Files to create

**`src/components/ParsePreviewModal.jsx`**

Props: `{ preview: { rules, friendId, rawText } | null, friendName, onConfirm, onCancel }`

- Header: "Does this look right?"
- Rule cards: title (editable inline), status badge, recurrence summary
- Checkbox per card (all checked by default)
- Footer: "Looks good, save all" / "Cancel"

### Files to modify

**`src/hooks/useFriendule.js`**

- Add state: `const [parsePreview, setParsePreview] = useState(null)`
- In `commitPrompt`, when `data.intent === 'create'`:
  ```js
  setParsePreview({ rules: data.rules, friendId: effectiveFriend.id, rawText: text });
  setParsing(false);
  return; // don't save yet
  ```
- Add `confirmParsePreview(selectedRules)`: iterates selected rules, POSTs each, updates `rules` state, calls `pushAction`, clears `parsePreview` and `prompt`
- Expose: `parsePreview, confirmParsePreview, closeParsePreview: () => setParsePreview(null)`

**`src/App.jsx`**

```jsx
<ParsePreviewModal
  preview={state.parsePreview}
  friendName={...}
  onConfirm={state.confirmParsePreview}
  onCancel={state.closeParsePreview}
/>
```

### Database changes

None.

### Implementation order

1. Create `ParsePreviewModal.jsx`
2. Modify `commitPrompt` in `useFriendule.js` to pause before saving
3. Add `confirmParsePreview` and `parsePreview` state
4. Wire into `App.jsx`

### Done criteria

- [ ] Typing a prompt and submitting shows the preview modal instead of immediately saving
- [ ] Unchecking a rule card excludes it from the save
- [ ] "Cancel" closes the modal and clears the prompt without saving anything
- [ ] Confirming saves exactly the selected rules and shows the toast

---

## Feature 6g: Undo for AI Actions

### Why this matters

If the AI misparses and creates or deletes something unexpected, there is currently no recovery path. An inline undo in the toast removes the fear of using AI input.

### Approach

Extend the existing single-slot `lastAction` into a queue of up to 5 actions, each auto-expiring after 10 seconds. The `Toast` component renders an inline "Undo" button when an action is present.

### Files to modify

**`src/hooks/useFriendule.js`**

- Replace `const [lastAction, setLastAction] = useState(null)` with `const [actionQueue, setActionQueue] = useState([])`
- Add `pushAction(action)`:
  ```js
  const undoTimerRef = useRef(null);
  const pushAction = (action) => {
    setActionQueue(q => [action, ...q].slice(0, 5));
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setActionQueue(q => q.slice(1)), 10000);
  };
  ```
- Replace all `setLastAction(...)` calls with `pushAction(...)`
- Rename `revertLastAction` → `undoLastAction`: operate on `actionQueue[0]`, pop it after. Remove the confirm dialog for small undos (≤3 rules); keep it for larger bulk deletes
- Expose: `actionQueue, undoLastAction`

**`src/components/Toast.jsx`**

Add `actionQueue` and `onUndo` props. Render "Undo" button inline when `actionQueue.length > 0`:
```jsx
{actionQueue?.length > 0 && (
  <button onClick={onUndo}>Undo</button>
)}
```

**`src/App.jsx`**

```jsx
<Toast message={state.toast} actionQueue={state.actionQueue} onUndo={state.undoLastAction} />
```

**`src/components/Header.jsx`**

Update any reference from `lastAction` → `actionQueue[0]`.

### Done criteria

- [ ] After the AI creates rules, the toast shows "N rules created — Undo"
- [ ] Clicking Undo deletes the just-created rules and shows "Undone"
- [ ] Undo button disappears after 10 seconds
- [ ] Queue holds up to 5 actions; older actions fall off the front

---

## Feature 6h: Schedule Templates

### Why this matters

For new users who don't know what to type, templates eliminate the blank-slate problem. One click populates a friend's calendar with a realistic starting schedule.

### Files to create

**`src/utils/templates.js`**

```js
export const TEMPLATES = [
  {
    id: 'nine-to-five',
    name: '9–5 Workweek',
    description: 'Standard office hours Mon–Fri',
    rules: [
      { title: 'Work', status: 'busy', recurrence: 'weekly',
        weekdays: [1,2,3,4,5], allDay: false, timeStart: '09:00', timeEnd: '17:00' },
    ],
  },
  {
    id: 'night-shift',
    name: 'Night Shift',
    description: 'Evening and overnight work schedule',
    rules: [
      { title: 'Night shift', status: 'busy', recurrence: 'weekly',
        weekdays: [0,1,2,3,4], allDay: false, timeStart: '22:00', timeEnd: '06:00' },
      { title: 'Sleep', status: 'busy', recurrence: 'weekly',
        weekdays: [0,1,2,3,4,5,6], allDay: false, timeStart: '06:00', timeEnd: '14:00' },
    ],
  },
  {
    id: 'student',
    name: 'Student Semester',
    description: 'Classes during the day, free evenings',
    rules: [
      { title: 'Classes', status: 'busy', recurrence: 'weekly',
        weekdays: [1,2,3,4,5], allDay: false, timeStart: '09:00', timeEnd: '15:00' },
      { title: 'Study', status: 'busy', recurrence: 'weekly',
        weekdays: [1,3,5], allDay: false, timeStart: '15:00', timeEnd: '18:00' },
      { title: 'Free evening', status: 'free', recurrence: 'weekly',
        weekdays: [2,4], allDay: false, timeStart: '15:00', timeEnd: '22:00' },
    ],
  },
  {
    id: 'remote',
    name: 'Remote Worker',
    description: 'Flexible remote schedule with focus blocks',
    rules: [
      { title: 'Focus time', status: 'busy', recurrence: 'weekly',
        weekdays: [1,2,3,4,5], allDay: false, timeStart: '09:00', timeEnd: '12:00' },
      { title: 'Open afternoon', status: 'free', recurrence: 'weekly',
        weekdays: [1,3,5], allDay: false, timeStart: '13:00', timeEnd: '17:00' },
      { title: 'Meetings', status: 'busy', recurrence: 'weekly',
        weekdays: [2,4], allDay: false, timeStart: '13:00', timeEnd: '15:00' },
    ],
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    description: 'Project-focused irregular schedule',
    rules: [
      { title: 'Client work', status: 'busy', recurrence: 'weekly',
        weekdays: [1,2,4], allDay: false, timeStart: '10:00', timeEnd: '18:00' },
      { title: 'Admin', status: 'busy', recurrence: 'weekly',
        weekdays: [3], allDay: false, timeStart: '09:00', timeEnd: '12:00' },
      { title: 'Free', status: 'free', recurrence: 'weekly',
        weekdays: [5,6,0], allDay: true },
    ],
  },
];
```

**`src/components/TemplatePickerModal.jsx`**

Props: `{ onSelect(templateRules), onCancel }`

- Grid of template cards (name + description)
- Clicking a card previews its rule list on the right
- "Apply template" → calls `onSelect(template.rules)`

### Files to modify

**`src/hooks/useFriendule.js`**

- Add state: `const [templateModal, setTemplateModal] = useState(false)`
- Add `applyTemplate(templateRules)`: bulk-POSTs rules for `effectiveFriend.id`, calls `pushAction`, closes modal, flashes toast
- Expose: `templateModal, openTemplateModal, closeTemplateModal, applyTemplate`

**`src/components/PromptBox.jsx`**

When `hasRules` prop is false, render below the example chips:
```jsx
<button onClick={openTemplateModal}>Or start from a template →</button>
```

**`src/App.jsx`**

Add `TemplatePickerModal` overlay. Pass `hasRules={...}` and `openTemplateModal` to `PromptBox`.

### Done criteria

- [ ] "Start from a template" link visible when friend has 0 rules
- [ ] Link not visible when friend already has rules
- [ ] Selecting "9–5 Workweek" and applying creates exactly 1 rule (Mon–Fri busy 9–5)
- [ ] Applied rules appear on the calendar immediately
- [ ] Undo (6g) works for template application

---

## Feature 6i: Shareable Availability Link

### Why this matters

A shareable link is a zero-friction viral loop: a user shares their availability (or a group view) with someone who isn't on Friendule yet, driving new registrations.

### Approach

`POST /share` creates a short token. `/view/:token` is detected in `App.jsx` before the auth check and renders a public, read-only `ShareView`. `GET /share/:token` is a public endpoint returning the scoped availability data.

### Files to create

| File | Purpose |
|------|---------|
| `backend/routes/share.js` | Create / read / delete share tokens |
| `src/components/ShareView.jsx` | Public read-only calendar for a token |
| `src/components/ShareModal.jsx` | Scope selector, expiry picker, copy-link button |

### Files to modify

**`backend/db.js`**

```sql
CREATE TABLE IF NOT EXISTS share_tokens (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  friend_ids JSONB NOT NULL DEFAULT '[]',
  scope      TEXT NOT NULL DEFAULT 'group',  -- 'personal' | 'group'
  expires_at BIGINT,
  created_at BIGINT NOT NULL
);
```

**`backend/server.js`**

```js
const shareRoutes = require('./routes/share');
app.use('/share', shareRoutes); // auth applied per-route inside the file
```

**`src/App.jsx`**

Add before the `!state.auth` check:
```jsx
const shareToken = window.location.pathname.match(/^\/view\/([a-z0-9]+)$/i)?.[1];
if (shareToken) return <ShareView token={shareToken} />;
```

**`src/hooks/useFriendule.js`**

- Add `shareModal` state
- Add `createShareLink(friendIds, scope, expiryDays)` → `POST /share` → sets `shareModal.url`
- Expose: `shareModal, openShareModal, closeShareModal, createShareLink`

**`src/components/EveryoneView.jsx`**

Add "Share" button near "Find a time" that calls `openShareModal`.

### Database changes

```sql
CREATE TABLE IF NOT EXISTS share_tokens (
  token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  friend_ids JSONB NOT NULL DEFAULT '[]', scope TEXT NOT NULL DEFAULT 'group',
  expires_at BIGINT, created_at BIGINT NOT NULL
);
```

### API endpoints

```
POST /share  (auth required)
Body:     { friendIds: string[], scope: 'personal'|'group', expiryDays: number|null }
Response: { token: string, url: string, expiresAt: number|null }

GET /share/:token  (no auth required)
Response: { scope, friends: [{ name, color, timezone }], rules: RuleShape[], expiresAt }

DELETE /share/:token  (auth required, creator only)
Response: { deleted: true }
```

### Done criteria

- [ ] Visiting `/view/<token>` shows the shared calendar without requiring login
- [ ] Expired tokens return a 410 Gone with a friendly message in `ShareView`
- [ ] Deleting a token makes `/view/<token>` return 404
- [ ] Copy-link button in `ShareModal` writes the URL to clipboard

---

## Feature 6j: Shared Hangouts / Proposed Events

### Why this matters

Closes the loop from "when are we free?" to "we're actually doing something." A proposed hangout with accept/decline gives the social action that makes the app feel alive.

> **Prerequisite**: Feature 6e (friend requests + `linked_user_id`) must be complete.

### Files to create

| File | Purpose |
|------|---------|
| `backend/routes/hangouts.js` | Create / list / respond / cancel hangouts |
| `src/components/HangoutsPanel.jsx` | List of upcoming hangouts within EveryoneView |
| `src/components/ProposeHangoutModal.jsx` | Date/time/title input + friend multi-select |

### Files to modify

**`backend/db.js`**

```sql
CREATE TABLE IF NOT EXISTS hangouts (
  id                  TEXT PRIMARY KEY,
  created_by          TEXT NOT NULL REFERENCES users(id),
  title               TEXT NOT NULL,
  proposed_date       TEXT NOT NULL,
  proposed_time_start TEXT,
  proposed_time_end   TEXT,
  created_at          BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS hangout_invites (
  id         TEXT PRIMARY KEY,
  hangout_id TEXT NOT NULL REFERENCES hangouts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id),
  status     TEXT NOT NULL DEFAULT 'pending'
               CHECK(status IN ('pending','accepted','declined')),
  created_at BIGINT NOT NULL,
  UNIQUE(hangout_id, user_id)
);
```

**`backend/server.js`**

```js
const hangoutsRoutes = require('./routes/hangouts');
app.use('/hangouts', authMiddleware, hangoutsRoutes);
app.use('/hangout-invites', authMiddleware, hangoutsRoutes);
```

**`src/hooks/useFriendule.js`**

- Add `hangouts` state, `fetchHangouts`, `proposeHangout`, `respondToHangout`
- Include `fetchHangouts()` in initial `Promise.all`
- Expose: `hangouts, proposeHangout, respondToHangout, proposeHangoutModal, openProposeHangout, closeProposeHangout`

**`src/App.jsx`**

Pass `hangouts` and `openProposeHangout` to `EveryoneView`. Add `ProposeHangoutModal` overlay.

### Database changes

See tables above.

### API endpoints

```
POST /hangouts
Body:     { title, proposedDate, proposedTimeStart, proposedTimeEnd, inviteeUserIds: string[] }
Response: { hangout, invites }

GET /hangouts
Response: { hangouts: [{ ...hangout, myStatus, invites: [{ userId, status }] }] }

PATCH /hangout-invites/:id
Body:     { status: 'accepted' | 'declined' }
Response: { invite: { id, status } }

DELETE /hangouts/:id
Response: { deleted: true }
```

### Done criteria

- [ ] Proposing a hangout creates invite rows for all selected friends
- [ ] Invited users see the hangout in their panel with Accept/Decline buttons
- [ ] Accepted hangouts appear on the calendar as `status: 'together'` entries
- [ ] Only the creator can delete a hangout; invitees can only decline

---

## Feature 6k: Guided First-Run Flow

### Why this matters

New users with a blank screen have no clear first action. A three-step overlay removes that friction by pointing at exactly what to do, in order.

### Approach

Detect `regularFriends.length === 0 && rules.length === 0` after initial data load (and `localStorage.friendule_onboarded` not set). Render a three-step overlay that auto-advances via `useEffect` watching `friends`, `rules`, and `tab`. "Skip intro" is always available.

### Files to create

**`src/components/OnboardingOverlay.jsx`**

- Full-screen semi-transparent overlay with a centred card
- Step 1: "Who do you want to track?" — CTA opens `AddFriendModal`; auto-advances when `regularFriends.length > 0`
- Step 2: "Tell us their schedule" — tooltip/arrow pointing at `PromptBox` with example text; auto-advances when `rules.length > 0`
- Step 3: "See when to hang out" — arrow pointing at the "Everyone" tab; auto-dismisses when `tab === 'everyone'`
- Progress dots (1/2/3)
- "Skip intro" link always visible

### Files to modify

**`src/hooks/useFriendule.js`**

- Add state: `const [onboardingStep, setOnboardingStep] = useState(null)`
- After initial load, if `regularFriends.length === 0 && rules.length === 0 && !localStorage.getItem('friendule_onboarded')`: set `onboardingStep` to `1`
- Add `useEffect` with `[regularFriends.length, rules.length, tab]` dependency to auto-advance:
  ```js
  useEffect(() => {
    if (onboardingStep === 1 && regularFriends.length > 0) setOnboardingStep(2);
    if (onboardingStep === 2 && rules.length > 0) setOnboardingStep(3);
    if (onboardingStep === 3 && tab === 'everyone') dismissOnboarding();
  }, [regularFriends.length, rules.length, tab, onboardingStep]);
  ```
- Add `dismissOnboarding()`: sets `onboardingStep = null`, writes `localStorage.friendule_onboarded = 'true'`
- Expose: `onboardingStep, dismissOnboarding`

**`src/App.jsx`**

```jsx
{state.onboardingStep && (
  <OnboardingOverlay
    step={state.onboardingStep}
    onSkip={state.dismissOnboarding}
    openAddFriend={state.openAddFriend}
    goEveryone={() => state.setTab('everyone')}
  />
)}
```

### Database changes

None. Progress tracked in `localStorage`.

### Done criteria

- [ ] New user (0 friends, 0 rules) sees the overlay immediately after login
- [ ] Overlay does not appear for returning users with existing data
- [ ] "Skip intro" immediately dismisses the overlay and sets `friendule_onboarded`
- [ ] Adding a friend auto-advances from step 1 to step 2
- [ ] Adding a rule auto-advances from step 2 to step 3
- [ ] Navigating to "Everyone" tab dismisses the overlay from step 3
- [ ] Overlay never reappears after being dismissed or completed
