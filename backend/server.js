const app = require('./app');
const { init: initDb } = require('./db');

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

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
