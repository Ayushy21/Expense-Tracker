/**
 * SQLite database initialization and schema.
 * Uses better-sqlite3 for synchronous, fast access. Path is from config.
 */
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';

let db = null;

/**
 * Ensure data directory exists and return a connected DB instance.
 * @returns {import('better-sqlite3').Database}
 */
export function getDb() {
  if (db) return db;

  const dbPath = config.dbPath;
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);

  // Enable foreign keys (optional; we have a single table for now)
  db.pragma('foreign_keys = ON');

  // Create expenses table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount_cents INTEGER NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      idempotency_key TEXT UNIQUE
    );
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_expenses_idempotency ON expenses(idempotency_key) WHERE idempotency_key IS NOT NULL;
  `);

  return db;
}

/**
 * Close the database connection (e.g. on shutdown).
 */
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
