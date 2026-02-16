/**
 * API client for Expense Tracker backend.
 * Uses VITE_API_URL in production; in dev uses Vite proxy /api -> backend.
 */

// In dev, Vite proxies /api to backend; in prod set VITE_API_URL to backend URL
const BASE = import.meta.env.VITE_API_URL || '/api';

function getUrl(path) {
  const base = BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Parse JSON or throw a clear error when response is HTML/empty (e.g. backend not running).
 */
async function parseJson(res) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Server returned an invalid response. Is the backend running? From project root run: npm run dev (or: cd backend && npm start)');
  }
  try {
    return await res.json();
  } catch (e) {
    throw new Error('Server returned an invalid response. Is the backend running? From project root run: npm run dev (or: cd backend && npm start)');
  }
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function fetchApi(path, options = {}) {
  const url = getUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res;
}

/**
 * Create expense (idempotent). Pass idempotencyKey to handle retries safely.
 * @param {{ amount: number, category: string, description: string, date: string, idempotencyKey?: string }} payload
 * @returns {Promise<{ id: string, amount: number, category: string, description: string, date: string, created_at: string }>}
 */
export async function createExpense(payload) {
  const { idempotencyKey, ...body } = payload;
  const headers = {};
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

  const res = await fetchApi('/expenses', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await parseJson(res);
  if (!res.ok) {
    const err = new Error(data.message || 'Failed to create expense');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/**
 * List expenses with optional filter and sort.
 * @param {{ category?: string, sort?: string }} params
 * @returns {Promise<{ expenses: Array<{ id: string, amount: number, category: string, description: string, date: string, created_at: string }> }>}
 */
export async function listExpenses(params = {}) {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.sort === 'date_desc') search.set('sort', 'date_desc');

  const qs = search.toString();
  const path = qs ? `/expenses?${qs}` : '/expenses';
  const res = await fetchApi(path);

  const data = await parseJson(res);
  if (!res.ok) {
    const err = new Error(data.message || 'Failed to fetch expenses');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return { expenses: Array.isArray(data.expenses) ? data.expenses : [] };
}

/**
 * Get summary (total per category).
 * @returns {Promise<{ byCategory: Array<{ category: string, total: number }>, total: number }>}
 */
export async function getSummary() {
  const res = await fetchApi('/expenses/summary');
  const data = await parseJson(res);
  if (!res.ok) {
    const err = new Error(data.message || 'Failed to fetch summary');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return {
    byCategory: Array.isArray(data.byCategory) ? data.byCategory : [],
    total: typeof data.total === 'number' ? data.total : 0,
  };
}
