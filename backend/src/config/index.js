/**
 * Application configuration from environment variables.
 * Use .env in development; set vars in Render/Vercel for production.
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Resolve DB path so tests can set process.env.DB_PATH before first getDb() */
function getDbPath() {
  return process.env.DB_PATH || path.join(__dirname, '../../data/expenses.db');
}

export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  get dbPath() {
    return getDbPath();
  },
  /** Allowed CORS origin (frontend URL). Empty = allow same-origin only. */
  frontendOrigin: process.env.FRONTEND_ORIGIN || '',
};
