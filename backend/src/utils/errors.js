/**
 * Centralized API error responses.
 */

/**
 * Send JSON error response with status code and message.
 * @param {import('express').Response} res
 * @param {number} status
 * @param {string} message
 * @param {object} [details]
 */
export function sendError(res, status, message, details = {}) {
  res.status(status).json({
    error: true,
    message,
    ...details,
  });
}

/** 400 Bad Request – validation / client error */
export function badRequest(res, message, details = {}) {
  sendError(res, 400, message, details);
}

/** 404 Not Found */
export function notFound(res, message = 'Not found') {
  sendError(res, 404, message);
}

/** 500 Internal Server Error */
export function serverError(res, message = 'Internal server error') {
  sendError(res, 500, message);
}
