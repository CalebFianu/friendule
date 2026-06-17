require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { init: initDb } = require('./db');
const { authMiddleware } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const friendsRoutes = require('./routes/friends');
const eventsRoutes = require('./routes/events');
const rulesRoutes = require('./routes/rules');
const parseRoutes = require('./routes/parse');

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/friends', authMiddleware, friendsRoutes);
app.use('/events', authMiddleware, eventsRoutes);
app.use('/rules', authMiddleware, rulesRoutes);
app.use('/parse', authMiddleware, parseRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Friendule API running on http://localhost:${PORT}`);
      console.log(`CORS origin: ${FRONTEND_ORIGIN}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  });
