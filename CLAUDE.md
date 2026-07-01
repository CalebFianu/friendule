# Friendule — Project Context

Social calendar app: users track friends' availability and find time to hang out. Users describe schedules in plain English; Claude Haiku parses them into structured rules.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite (port 5173) |
| Date/time | Luxon |
| Backend | Node.js, Express 5 (port 4000) |
| Database | PostgreSQL |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) via Anthropic SDK |
| Auth | JWT (7-day expiry) + bcrypt |

## Key Files

```
src/
  App.jsx                      # Root component
  hooks/useFriendule.js        # All app state and logic (main hook)
  components/
    AuthScreen.jsx             # Login / register
    Header.jsx                 # Top nav + tab switcher
    FriendSwitcher.jsx         # Friend carousel + add button
    PromptBox.jsx              # AI natural-language input
    MonthGrid.jsx              # Month calendar view
    WeekView.jsx               # Week timeline view
    EveryoneView.jsx           # Multi-friend availability grid
    EventEditor.jsx            # Add / edit rule modal
    FriendDayPanel.jsx         # Day events panel (friend view)
    DayDetail.jsx              # Day detail panel (everyone view)
    ConflictBanner.jsx         # Conflicting rule warning
    AddFriendModal.jsx         # Add friend form
    Toast.jsx                  # Notification toast
  utils/
    ruleExpander.js            # Timezone-aware rule → interval expansion
    dateUtils.js               # Date helpers and formatters
    scheduleParser.js          # Regex-based parser (fallback)
    seedData.js                # Colour palette and sample data
backend/
  server.js                    # Express entry point
  db.js                        # PostgreSQL pool + schema init
  middleware/auth.js           # JWT verification
  routes/
    auth.js                    # POST /auth/register, /auth/login
    friends.js                 # CRUD /friends
    rules.js                   # CRUD /rules
    parse.js                   # POST /parse (Claude Haiku LLM)
```

## Rule Schema

| Field | Type | Notes |
|---|---|---|
| `title` | string | e.g. `"Work"`, `"Gym"` |
| `status` | string | `"busy"` / `"free"` / `"together"` |
| `recurrence` | string | `"once"` / `"weekly"` / `"daily"` |
| `allDay` | boolean | |
| `timeStart` / `timeEnd` | string | `HH:MM` 24-hour, required when not allDay |
| `date` | string | `YYYY-MM-DD`, required for `"once"` |
| `weekdays` | number[] | `[0–6]` (0=Sun), required for `"weekly"` |
| `friendId` | string | UUID |

## Dev Setup

```bash
# Backend
cd backend && node server.js

# Frontend
npm run dev
```

Requires: `backend/.env` with `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `FRONTEND_ORIGIN`.

## Key Behaviours

- Each friend gets a unique OKLCH colour used consistently across all views
- Rules are stored in each friend's IANA timezone, converted to local time for display
- Conflict detection: a friend can't be both busy and free on the same day
- AI parse flow: `PromptBox` → `POST /parse` → Claude Haiku → validated rules → saved + shown on calendar
- If input is ambiguous, Claude returns `clarification_needed` string instead of rules
