/**
 * Server entry point. Initializes DB and starts Express.
 */
import 'dotenv/config';
import app from './src/app.js';
import { config } from './src/config/index.js';
import { getDb, closeDb } from './src/db/init.js';

// Ensure DB is initialized at startup
getDb();

const server = app.listen(config.port, () => {
  console.log(`Expense Tracker API listening on port ${config.port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
});
