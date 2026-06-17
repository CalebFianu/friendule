const { Router } = require('express');
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
const { pool } = require('../db');
const { signToken } = require('../middleware/auth');

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const normalised = email.trim().toLowerCase();
  const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [normalised]);
  if (existing.length) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const id = uuid();
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
    [id, normalised, passwordHash, Date.now()]
  );

  const token = signToken(id);
  res.status(201).json({ token, user: { id, email: normalised } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalised = email.trim().toLowerCase();
  const { rows } = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [normalised]);
  if (!rows.length) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, email: user.email } });
});

module.exports = router;
