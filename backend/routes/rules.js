const { Router } = require('express');
const { v4: uuid } = require('uuid');
const { pool } = require('../db');

const router = Router();

function formatRule(row) {
  return {
    id: row.id,
    friendId: row.friend_id,
    title: row.title,
    status: row.status,
    recurrence: row.recurrence,
    allDay: row.all_day,
    timeStart: row.time_start,
    timeEnd: row.time_end,
    date: row.date,
    weekdays: row.weekdays,
    rawText: row.raw_text,
    createdAt: row.created_at,
  };
}

async function validateRule(body, userId) {
  const { friendId, title, status, recurrence, allDay, timeStart, timeEnd, date, weekdays } = body || {};

  if (!friendId) return 'friendId is required.';
  const { rows } = await pool.query('SELECT id FROM friends WHERE id = $1 AND owner_id = $2', [friendId, userId]);
  if (!rows.length) return 'Friend not found.';

  if (!recurrence || !['once', 'weekly', 'daily'].includes(recurrence)) return 'recurrence must be "once", "weekly", or "daily".';
  if (!title || typeof title !== 'string' || !title.trim()) return 'title is required.';
  if (!status || !['busy', 'free', 'together'].includes(status)) return 'status must be "busy", "free", or "together".';

  if (recurrence === 'once' && !date) return 'date is required for once rules.';
  if (recurrence === 'once' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'date must be YYYY-MM-DD.';

  if (recurrence === 'weekly') {
    if (!weekdays || !Array.isArray(weekdays) || weekdays.length === 0) return 'weekdays array is required for weekly rules.';
    if (weekdays.some(d => typeof d !== 'number' || d < 0 || d > 6)) return 'weekdays must be integers 0-6.';
  }

  if (!allDay) {
    if (!timeStart || !timeEnd) return 'timeStart and timeEnd are required for timed rules.';
    if (!/^\d{2}:\d{2}$/.test(timeStart) || !/^\d{2}:\d{2}$/.test(timeEnd)) return 'timeStart and timeEnd must be HH:MM.';
  }

  return null;
}

// GET /rules
router.get('/', async (req, res) => {
  const { friendId } = req.query;
  let rows;
  if (friendId) {
    ({ rows } = await pool.query('SELECT * FROM rules WHERE owner_id = $1 AND friend_id = $2 ORDER BY created_at ASC', [req.userId, friendId]));
  } else {
    ({ rows } = await pool.query('SELECT * FROM rules WHERE owner_id = $1 ORDER BY created_at ASC', [req.userId]));
  }
  res.json({ rules: rows.map(formatRule) });
});

// POST /rules
router.post('/', async (req, res) => {
  const err = await validateRule(req.body, req.userId);
  if (err) return res.status(400).json({ error: err });

  const { friendId, title, status, recurrence, allDay, timeStart, timeEnd, date, weekdays, rawText } = req.body;
  const id = uuid();
  const now = Date.now();

  await pool.query(
    `INSERT INTO rules (id, friend_id, owner_id, title, status, recurrence, all_day, time_start, time_end, date, weekdays, raw_text, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      id, friendId, req.userId, title.trim(), status, recurrence,
      !!allDay,
      allDay ? null : timeStart,
      allDay ? null : timeEnd,
      recurrence === 'once' ? date : null,
      recurrence === 'weekly' ? JSON.stringify(weekdays) : null,
      rawText || '',
      now
    ]
  );

  const { rows } = await pool.query('SELECT * FROM rules WHERE id = $1', [id]);
  res.status(201).json(formatRule(rows[0]));
});

// PUT /rules/:id
router.put('/:id', async (req, res) => {
  const { rows: existing } = await pool.query('SELECT id FROM rules WHERE id = $1 AND owner_id = $2', [req.params.id, req.userId]);
  if (!existing.length) return res.status(404).json({ error: 'Rule not found.' });

  const err = await validateRule(req.body, req.userId);
  if (err) return res.status(400).json({ error: err });

  const { friendId, title, status, recurrence, allDay, timeStart, timeEnd, date, weekdays, rawText } = req.body;

  await pool.query(
    `UPDATE rules SET friend_id=$1, title=$2, status=$3, recurrence=$4, all_day=$5, time_start=$6, time_end=$7, date=$8, weekdays=$9, raw_text=$10 WHERE id=$11`,
    [
      friendId, title.trim(), status, recurrence,
      !!allDay,
      allDay ? null : timeStart,
      allDay ? null : timeEnd,
      recurrence === 'once' ? date : null,
      recurrence === 'weekly' ? JSON.stringify(weekdays) : null,
      rawText || '',
      req.params.id
    ]
  );

  const { rows } = await pool.query('SELECT * FROM rules WHERE id = $1', [req.params.id]);
  res.json(formatRule(rows[0]));
});

// DELETE /rules/:id
router.delete('/:id', async (req, res) => {
  const { rows: existing } = await pool.query('SELECT id FROM rules WHERE id = $1 AND owner_id = $2', [req.params.id, req.userId]);
  if (!existing.length) return res.status(404).json({ error: 'Rule not found.' });

  await pool.query('DELETE FROM rules WHERE id = $1', [req.params.id]);
  res.json({ deleted: true });
});

module.exports = router;
