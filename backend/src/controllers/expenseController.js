/**
 * Expense API controller: create (idempotent), list (filter/sort), summary.
 */
import { randomUUID } from 'crypto';
import { getDb } from '../db/init.js';
import { fromCents } from '../utils/money.js';
import { badRequest, serverError } from '../utils/errors.js';

/**
 * Map DB row to API response (amount as decimal).
 * @param {object} row
 * @returns {object}
 */
function rowToExpense(row) {
  return {
    id: row.id,
    amount: fromCents(row.amount_cents),
    category: row.category,
    description: row.description,
    date: row.date,
    created_at: row.created_at,
  };
}

/**
 * POST /expenses – Create expense (idempotent).
 * Uses X-Idempotency-Key header or body.idempotencyKey. If key exists, returns existing expense.
 */
export function createExpense(req, res) {
  const { validated } = req;
  const idempotencyKey = req.get('X-Idempotency-Key') || req.body?.idempotencyKey || null;

  const db = getDb();

  if (idempotencyKey) {
    const existing = db.prepare(
      'SELECT * FROM expenses WHERE idempotency_key = ?'
    ).get(idempotencyKey);
    if (existing) {
      return res.status(200).json(rowToExpense(existing));
    }
  }

  const id = randomUUID();
  const created_at = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO expenses (id, amount_cents, category, description, date, created_at, idempotency_key)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      validated.amount_cents,
      validated.category,
      validated.description,
      validated.date,
      created_at,
      idempotencyKey || null
    );
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE' && e.message.includes('idempotency_key')) {
      const existing = db.prepare(
        'SELECT * FROM expenses WHERE idempotency_key = ?'
      ).get(idempotencyKey);
      if (existing) {
        return res.status(200).json(rowToExpense(existing));
      }
    }
    return serverError(res, 'Failed to create expense');
  }

  res.status(201).json(rowToExpense({
    id,
    amount_cents: validated.amount_cents,
    category: validated.category,
    description: validated.description,
    date: validated.date,
    created_at,
  }));
}

/**
 * GET /expenses – List expenses with optional category filter and sort=date_desc.
 */
export function listExpenses(req, res) {
  const { category, sort } = req.query;
  const db = getDb();

  let sql = 'SELECT * FROM expenses';
  const params = [];

  if (category && String(category).trim() !== '') {
    sql += ' WHERE category = ?';
    params.push(String(category).trim());
  }

  sql += sort === 'date_desc' ? ' ORDER BY date DESC, created_at DESC' : ' ORDER BY created_at ASC';

  const rows = db.prepare(sql).all(...params);
  const expenses = rows.map(rowToExpense);

  res.json({ expenses });
}

/**
 * GET /expenses/summary – Total per category (nice-to-have).
 */
export function getSummary(req, res) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT category, SUM(amount_cents) AS total_cents
    FROM expenses
    GROUP BY category
    ORDER BY total_cents DESC
  `).all();

  const byCategory = rows.map((r) => ({
    category: r.category,
    total: fromCents(r.total_cents),
  }));

  const total = rows.reduce((sum, r) => sum + r.total_cents, 0);

  res.json({
    byCategory,
    total: fromCents(total),
  });
}
