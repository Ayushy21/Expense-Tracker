/**
 * Integration tests for /expenses API (POST, GET, idempotency).
 * Uses a temporary SQLite DB. Run: npm run test:integration
 * Set DB_PATH to a temp file before loading app so tests don't touch real DB.
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import supertest from 'supertest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, '../../data/test-expenses.db');

// Must set before app loads config
process.env.DB_PATH = testDbPath;

import app from '../app.js';

describe('POST /expenses', () => {
  before(() => {
    process.env.DB_PATH = testDbPath;
    const dir = path.dirname(testDbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  it('creates expense and returns 201', async () => {
    const body = {
      amount: 19.99,
      category: 'Food',
      description: 'Lunch',
      date: '2025-02-16',
    };
    const res = await supertest(app)
      .post('/expenses')
      .send(body)
      .expect(201);
    const data = res.body;
    assert.ok(data.id);
    assert.strictEqual(data.amount, 19.99);
    assert.strictEqual(data.category, 'Food');
    assert.strictEqual(data.description, 'Lunch');
    assert.strictEqual(data.date, '2025-02-16');
    assert.ok(data.created_at);
  });

  it('idempotent: same key returns 200 and same expense', async () => {
    const key = 'test-idempotency-' + Date.now();
    const body = {
      amount: 5.5,
      category: 'Transport',
      description: 'Bus',
      date: '2025-02-16',
      idempotencyKey: key,
    };
    const res1 = await supertest(app)
      .post('/expenses')
      .set('X-Idempotency-Key', key)
      .send(body)
      .expect(201);
    const data1 = res1.body;

    const res2 = await supertest(app)
      .post('/expenses')
      .set('X-Idempotency-Key', key)
      .send(body)
      .expect(200);
    const data2 = res2.body;
    assert.strictEqual(data1.id, data2.id);
  });

  it('validation: negative amount returns 400', async () => {
    const res = await supertest(app)
      .post('/expenses')
      .send({
        amount: -10,
        category: 'X',
        description: 'Y',
        date: '2025-02-16',
      })
      .expect(400);
    assert.ok(res.body.message?.toLowerCase().includes('negative'));
  });

  it('validation: missing required fields returns 400', async () => {
    await supertest(app)
      .post('/expenses')
      .send({ amount: 10 })
      .expect(400);
  });
});

describe('GET /expenses', () => {
  it('returns list with sort=date_desc', async () => {
    const res = await supertest(app)
      .get('/expenses?sort=date_desc')
      .expect(200);
    assert.ok(Array.isArray(res.body.expenses));
  });

  it('returns list filtered by category', async () => {
    const res = await supertest(app)
      .get('/expenses?category=Food')
      .expect(200);
    assert.ok(Array.isArray(res.body.expenses));
  });
});

describe('GET /expenses/summary', () => {
  it('returns byCategory and total', async () => {
    const res = await supertest(app)
      .get('/expenses/summary')
      .expect(200);
    assert.ok(Array.isArray(res.body.byCategory));
    assert.strictEqual(typeof res.body.total, 'number');
  });
});
