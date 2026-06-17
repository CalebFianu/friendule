const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/friendule',
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id           TEXT PRIMARY KEY,
      email        TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at   BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS friends (
      id          TEXT PRIMARY KEY,
      owner_id    TEXT NOT NULL REFERENCES users(id),
      name        TEXT NOT NULL,
      color       TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      timezone    TEXT NOT NULL DEFAULT 'Africa/Accra',
      created_at  BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id         TEXT PRIMARY KEY,
      friend_id  TEXT NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
      owner_id   TEXT NOT NULL REFERENCES users(id),
      type       TEXT NOT NULL CHECK(type IN ('single', 'weekly')),
      title      TEXT NOT NULL,
      status     TEXT NOT NULL CHECK(status IN ('busy', 'free')),
      all_day    BOOLEAN NOT NULL DEFAULT false,
      start_min  INTEGER,
      end_min    INTEGER,
      date       TEXT,
      weekdays   JSONB,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rules (
      id         TEXT PRIMARY KEY,
      friend_id  TEXT NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
      owner_id   TEXT NOT NULL REFERENCES users(id),
      title      TEXT NOT NULL,
      status     TEXT NOT NULL CHECK(status IN ('busy', 'free', 'together')),
      recurrence TEXT NOT NULL CHECK(recurrence IN ('once', 'weekly', 'daily')),
      all_day    BOOLEAN NOT NULL DEFAULT false,
      time_start TEXT,
      time_end   TEXT,
      date       TEXT,
      weekdays   JSONB,
      raw_text   TEXT NOT NULL DEFAULT '',
      created_at BIGINT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_friends_owner ON friends(owner_id);
    CREATE INDEX IF NOT EXISTS idx_events_owner ON events(owner_id);
    CREATE INDEX IF NOT EXISTS idx_events_friend ON events(friend_id);
    CREATE INDEX IF NOT EXISTS idx_rules_owner ON rules(owner_id);
    CREATE INDEX IF NOT EXISTS idx_rules_friend ON rules(friend_id);
  `);

  // Migrate: expand status check constraint to include 'together'
  await pool.query(`
    ALTER TABLE rules
      DROP CONSTRAINT IF EXISTS rules_status_check;
    ALTER TABLE rules
      ADD CONSTRAINT rules_status_check CHECK(status IN ('busy', 'free', 'together'));
  `);
}

module.exports = { pool, init };
