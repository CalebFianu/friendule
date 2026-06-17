const { Router } = require('express');
const { v4: uuid } = require('uuid');
const { pool } = require('../db');

const router = Router();

function formatEvent(row) {
  return {
    id: row.id,
    friendId: row.friend_id,
    type: row.type,
    title: row.title,
    status: row.status,
    allDay: row.all_day,
    startMin: row.start_min,
    endMin: row.end_min,
    date: row.date,
    weekdays: row.weekdays,
    createdAt: row.created_at
  };
}

async function validateEvent(body, userId) {
  const { friendId, type, title, status, allDay, startMin, endMin, date, weekdays } = body || {};

  if (!friendId) return 'friendId is required.';
  const { rows } = await pool.query('SELECT id FROM friends WHERE id = $1 AND owner_id = $2', [friendId, userId]);
  if (!rows.length) return 'Friend not found.';

  if (!type || !['single', 'weekly'].includes(type)) return 'type must be "single" or "weekly".';
  if (!title || typeof title !== 'string' || !title.trim()) return 'title is required.';
  if (!status || !['busy', 'free'].includes(status)) return 'status must be "busy" or "free".';

  if (type === 'single' && !date) return 'date is required for single events.';
  if (type === 'single' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'date must be YYYY-MM-DD.';

  if (type === 'weekly') {
    if (!weekdays || !Array.isArray(weekdays) || weekdays.length === 0) return 'weekdays array is required for weekly events.';
    if (weekdays.some(d => typeof d !== 'number' || d < 0 || d > 6)) return 'weekdays must be integers 0-6.';
  }

  if (!allDay) {
    if (startMin == null || endMin == null) return 'startMin and endMin are required for timed events.';
    if (typeof startMin !== 'number' || typeof endMin !== 'number') return 'startMin and endMin must be numbers.';
  }

  return null;
}

// GET /events
router.get('/', async (req, res) => {
  const { friendId } = req.query;
  let rows;
  if (friendId) {
    ({ rows } = await pool.query('SELECT * FROM events WHERE owner_id = $1 AND friend_id = $2 ORDER BY created_at ASC', [req.userId, friendId]));
  } else {
    ({ rows } = await pool.query('SELECT * FROM events WHERE owner_id = $1 ORDER BY created_at ASC', [req.userId]));
  }
  res.json({ events: rows.map(formatEvent) });
});

// POST /events
router.post('/', async (req, res) => {
  const err = await validateEvent(req.body, req.userId);
  if (err) return res.status(400).json({ error: err });

  const { friendId, type, title, status, allDay, startMin, endMin, date, weekdays } = req.body;
  const id = uuid();
  const now = Date.now();

  await pool.query(
    `INSERT INTO events (id, friend_id, owner_id, type, title, status, all_day, start_min, end_min, date, weekdays, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      id, friendId, req.userId, type, title.trim(), status,
      !!allDay,
      allDay ? null : startMin,
      allDay ? null : endMin,
      type === 'single' ? date : null,
      type === 'weekly' ? JSON.stringify(weekdays) : null,
      now
    ]
  );

  const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
  res.status(201).json(formatEvent(rows[0]));
});

// PUT /events/:id
router.put('/:id', async (req, res) => {
  const { rows: existing } = await pool.query('SELECT id FROM events WHERE id = $1 AND owner_id = $2', [req.params.id, req.userId]);
  if (!existing.length) return res.status(404).json({ error: 'Event not found.' });

  const err = await validateEvent(req.body, req.userId);
  if (err) return res.status(400).json({ error: err });

  const { friendId, type, title, status, allDay, startMin, endMin, date, weekdays } = req.body;

  await pool.query(
    `UPDATE events SET friend_id=$1, type=$2, title=$3, status=$4, all_day=$5, start_min=$6, end_min=$7, date=$8, weekdays=$9 WHERE id=$10`,
    [
      friendId, type, title.trim(), status,
      !!allDay,
      allDay ? null : startMin,
      allDay ? null : endMin,
      type === 'single' ? date : null,
      type === 'weekly' ? JSON.stringify(weekdays) : null,
      req.params.id
    ]
  );

  const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
  res.json(formatEvent(rows[0]));
});

// DELETE /events/:id
router.delete('/:id', async (req, res) => {
  const { rows: existing } = await pool.query('SELECT id FROM events WHERE id = $1 AND owner_id = $2', [req.params.id, req.userId]);
  if (!existing.length) return res.status(404).json({ error: 'Event not found.' });

  await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
  res.json({ deleted: true });
});

module.exports = router;
