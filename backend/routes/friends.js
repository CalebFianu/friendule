const { Router } = require('express');
const { v4: uuid } = require('uuid');
const { pool } = require('../db');

const router = Router();

const PALETTE = [
  'oklch(0.70 0.15 25)', 'oklch(0.74 0.14 65)', 'oklch(0.70 0.12 155)',
  'oklch(0.66 0.12 245)', 'oklch(0.64 0.15 320)', 'oklch(0.68 0.14 195)',
  'oklch(0.72 0.13 285)', 'oklch(0.71 0.13 110)'
];

async function pickColor(ownerId) {
  const { rows } = await pool.query('SELECT color FROM friends WHERE owner_id = $1', [ownerId]);
  const used = rows.map(r => r.color);
  return PALETTE.find(c => !used.includes(c)) || PALETTE[used.length % PALETTE.length];
}

function formatFriend(row) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    description: row.description,
    timezone: row.timezone || 'Africa/Accra',
    createdAt: row.created_at
  };
}

// GET /friends
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM friends WHERE owner_id = $1 ORDER BY created_at ASC', [req.userId]);
  res.json({ friends: rows.map(formatFriend) });
});

// POST /friends
router.post('/', async (req, res) => {
  const { name, color, description } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  const id = uuid();
  const now = Date.now();
  const finalColor = color || await pickColor(req.userId);
  const finalDesc = (description || '').trim();
  const finalTz = (req.body.timezone || '').trim() || 'Africa/Accra';

  await pool.query(
    'INSERT INTO friends (id, owner_id, name, color, description, timezone, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [id, req.userId, name.trim(), finalColor, finalDesc, finalTz, now]
  );

  res.status(201).json(formatFriend({ id, name: name.trim(), color: finalColor, description: finalDesc, timezone: finalTz, created_at: now }));
});

// PATCH /friends/:id
router.patch('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM friends WHERE id = $1 AND owner_id = $2', [req.params.id, req.userId]);
  if (!rows.length) {
    return res.status(404).json({ error: 'Friend not found.' });
  }
  const friend = rows[0];

  const { name, color, description, timezone } = req.body || {};
  const updates = {};
  if (name !== undefined) updates.name = name.trim() || friend.name;
  if (color !== undefined) updates.color = color;
  if (description !== undefined) updates.description = description;
  if (timezone !== undefined) updates.timezone = timezone;

  if (Object.keys(updates).length === 0) {
    return res.json(formatFriend(friend));
  }

  const keys = Object.keys(updates);
  const vals = Object.values(updates);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  await pool.query(`UPDATE friends SET ${sets} WHERE id = $${keys.length + 1}`, [...vals, friend.id]);

  const { rows: updated } = await pool.query('SELECT * FROM friends WHERE id = $1', [friend.id]);
  res.json(formatFriend(updated[0]));
});

// DELETE /friends/:id
router.delete('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT id FROM friends WHERE id = $1 AND owner_id = $2', [req.params.id, req.userId]);
  if (!rows.length) {
    return res.status(404).json({ error: 'Friend not found.' });
  }

  await pool.query('DELETE FROM friends WHERE id = $1', [rows[0].id]);
  res.json({ deleted: true });
});

module.exports = router;
