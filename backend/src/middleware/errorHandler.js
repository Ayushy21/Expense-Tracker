/**
 * Global Express error handler.
 * Logs errors and returns a safe JSON response (no stack in production).
 */
import { config } from '../config/index.js';
import { sendError } from '../utils/errors.js';

export function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.statusCode || err.status || 500;
  const message = status < 500 || config.nodeEnv === 'development'
    ? (err.message || 'Internal server error')
    : 'Internal server error';

  sendError(res, status, message);
}
