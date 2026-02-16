/**
 * Validation middleware for POST /expenses.
 * Ensures required fields and valid amount (non-negative).
 */
import { badRequest } from '../utils/errors.js';
import { toCents } from '../utils/money.js';

/**
 * Validate create-expense body: amount, category, description, date.
 * Amount is validated via toCents (required, non-negative, numeric).
 */
export function validateCreateExpense(req, res, next) {
  const { amount, category, description, date } = req.body || {};

  const missing = [];
  if (category === undefined || category === null || String(category).trim() === '') missing.push('category');
  if (description === undefined || description === null) missing.push('description');
  if (date === undefined || date === null || String(date).trim() === '') missing.push('date');
  if (amount === undefined && amount !== 0) missing.push('amount');

  if (missing.length > 0) {
    return badRequest(res, `Missing or empty required fields: ${missing.join(', ')}`);
  }

  let amountCents;
  try {
    amountCents = toCents(amount);
  } catch (e) {
    return badRequest(res, e.message);
  }

  // Basic date format: YYYY-MM-DD
  const dateStr = String(date).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return badRequest(res, 'Date must be in YYYY-MM-DD format');
  }

  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    return badRequest(res, 'Invalid date');
  }

  // Attach normalized values for controller
  req.validated = {
    amount_cents: amountCents,
    category: String(category).trim(),
    description: String(description).trim(),
    date: dateStr,
  };
  next();
}
