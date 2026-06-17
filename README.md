# Friendule

A social calendar app for tracking your friends' schedules and finding time to hang out. Describe a friend's availability in plain English and AI turns it into calendar rules automatically.

---

## Features

- **AI-powered schedule parsing** — type things like *"Busy weekdays 9–5, gym Mon & Wed 7am, free this weekend"* and Claude converts it into structured rules
- **Multiple calendar views** — month grid and week timeline per friend; an "Everyone" view that shows all friends' availability at a glance
- **Three event statuses** — Busy, Free, and Together (for activities you'll be doing with that friend)
- **Recurring rules** — once, weekly (by weekday), or daily
- **Timezone-aware** — each friend's rules are stored in their IANA timezone and converted to your local time for display
- **Conflict detection** — prevents a friend from being marked both busy and free on the same day; flags pre-existing conflicts with a one-click fix
- **Colour-coded friends** — each friend gets a unique OKLCH colour used consistently across all views

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite |
| Date/time | Luxon |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) via Anthropic SDK |
| Auth | JWT (7-day expiry) + bcrypt |

---

## Project Structure

```
Friendule/
├── src/
│   ├── components/
│   │   ├── AuthScreen.jsx       # Login / register form
│   │   ├── Header.jsx           # Top nav with tab switcher
│   │   ├── FriendSwitcher.jsx   # Friend carousel + add button
│   │   ├── PromptBox.jsx        # AI natural-language input
│   │   ├── MonthGrid.jsx        # Month calendar view
│   │   ├── WeekView.jsx         # Week timeline view
│   │   ├── EveryoneView.jsx     # Multi-friend availability grid
│   │   ├── EventEditor.jsx      # Add / edit rule modal
│   │   ├── FriendDayPanel.jsx   # Day events panel (friend view)
│   │   ├── DayDetail.jsx        # Day detail panel (everyone view)
│   │   ├── ConflictBanner.jsx   # Conflicting rule warning
│   │   ├── AddFriendModal.jsx   # Add friend form
│   │   └── Toast.jsx            # Notification toast
│   ├── hooks/
│   │   └── useFriendule.js      # All app state and logic
│   └── utils/
│       ├── ruleExpander.js      # Timezone-aware rule → interval expansion
│       ├── dateUtils.js         # Date helpers and formatters
│       ├── scheduleParser.js    # Regex-based parser (fallback)
│       └── seedData.js          # Colour palette and sample data
├── backend/
│   ├── server.js                # Express app entry point
│   ├── db.js                    # PostgreSQL pool + schema init
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   └── routes/
│       ├── auth.js              # POST /auth/register, /auth/login
│       ├── friends.js           # CRUD /friends
│       ├── rules.js             # CRUD /rules
│       └── parse.js             # POST /parse (LLM)
├── index.html
├── vite.config.js
└── package.json
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- An [Anthropic API key](https://console.anthropic.com)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Set up the database

```sql
CREATE DATABASE friendule;
```

The schema is created automatically when the backend starts for the first time.

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=4000
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/friendule
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET=your-long-random-secret-here
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (from project root)
cd ..
npm install
```

### 5. Start the development servers

**Backend** (runs on port 4000):

```bash
cd backend
node server.js
```

**Frontend** (runs on port 5173):

```bash
# From project root
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

All variables are required in production. The defaults shown are for local development only.

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/friendule` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `JWT_SECRET` | Secret for signing JWT tokens | `dev-secret-change-me` |
| `ANTHROPIC_API_KEY` | Anthropic API key for schedule parsing | — |

---

## API Reference

All routes except `/auth/*` and `/health` require a `Bearer` token in the `Authorization` header.

### Auth

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create account (email + password, min 6 chars) |
| POST | `/auth/login` | Login and receive JWT |

### Friends

| Method | Route | Description |
|---|---|---|
| GET | `/friends` | List your friends |
| POST | `/friends` | Add a friend |
| PATCH | `/friends/:id` | Update friend details |
| DELETE | `/friends/:id` | Delete a friend and all their rules |

### Rules

| Method | Route | Description |
|---|---|---|
| GET | `/rules` | List rules (optional `?friendId=` filter) |
| POST | `/rules` | Create a rule |
| PUT | `/rules/:id` | Update a rule |
| DELETE | `/rules/:id` | Delete a rule |

### AI Parsing

| Method | Route | Description |
|---|---|---|
| POST | `/parse` | Convert natural language to rule objects |

**Request body:**
```json
{ "text": "Busy weekdays 9-5, free this weekend" }
```

**Response:**
```json
{
  "rules": [
    {
      "title": "Work",
      "status": "busy",
      "recurrence": "weekly",
      "weekdays": [1, 2, 3, 4, 5],
      "allDay": false,
      "timeStart": "09:00",
      "timeEnd": "17:00"
    }
  ],
  "clarification_needed": null
}
```

### Rule Schema

| Field | Type | Values |
|---|---|---|
| `title` | string | Short label, e.g. `"Work"`, `"Gym"` |
| `status` | string | `"busy"` / `"free"` / `"together"` |
| `recurrence` | string | `"once"` / `"weekly"` / `"daily"` |
| `allDay` | boolean | |
| `timeStart` | string | `HH:MM` (24-hour), required when `allDay` is false |
| `timeEnd` | string | `HH:MM` (24-hour), required when `allDay` is false |
| `date` | string | `YYYY-MM-DD`, required when `recurrence` is `"once"` |
| `weekdays` | number[] | `[0–6]` (0 = Sunday), required when `recurrence` is `"weekly"` |
| `friendId` | string | UUID of the friend this rule belongs to |

---

## How Schedule Parsing Works

1. You type a free-form schedule description in the prompt box
2. The text is sent to `POST /parse`
3. The backend forwards it to Claude Haiku with a structured system prompt
4. Claude returns a JSON array of rules
5. Each rule is validated and conflict-checked against existing rules for that friend
6. Valid rules are saved and appear on the calendar immediately

If the input is ambiguous, Claude returns a `clarification_needed` question instead of rules, which is displayed as a prompt for the user to refine their input.

---

## Building for Production

```bash
# Build the frontend
npm run build
# Output is in dist/ — serve with any static file host

# Run the backend
cd backend
NODE_ENV=production node server.js
```

Set `FRONTEND_ORIGIN` in the backend `.env` to your deployed frontend URL before running in production.
