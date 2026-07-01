require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { authMiddleware } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const friendsRoutes = require('./routes/friends');
const eventsRoutes = require('./routes/events');
const rulesRoutes = require('./routes/rules');
const parseRoutes = require('./routes/parse');
const transcribeRoutes = require('./routes/transcribe');

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/friends', authMiddleware, friendsRoutes);
app.use('/events', authMiddleware, eventsRoutes);
app.use('/rules', authMiddleware, rulesRoutes);
app.use('/parse', authMiddleware, parseRoutes);
app.use('/transcribe', authMiddleware, transcribeRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

module.exports = app;
