/**
 * Unit tests for money utilities (toCents / fromCents).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { toCents, fromCents } from './money.js';

describe('toCents', () => {
  it('converts decimal string to cents', () => {
    assert.strictEqual(toCents('19.99'), 1999);
    assert.strictEqual(toCents('0.01'), 1);
    assert.strictEqual(toCents('0'), 0);
  });

  it('converts number to cents', () => {
    assert.strictEqual(toCents(19.99), 1999);
    assert.strictEqual(toCents(0), 0);
  });

  it('rounds to 2 decimal places', () => {
    assert.strictEqual(toCents('19.994'), 1999);
    assert.strictEqual(toCents('19.996'), 2000);
  });

  it('throws for negative amount', () => {
    assert.throws(() => toCents(-1), /cannot be negative/);
    assert.throws(() => toCents('-0.01'), /cannot be negative/);
  });

  it('throws for invalid or missing amount', () => {
    assert.throws(() => toCents(''), /required/);
    assert.throws(() => toCents('abc'), /valid number/);
    assert.throws(() => toCents(null), /required/);
  });
});

describe('fromCents', () => {
  it('converts cents to decimal', () => {
    assert.strictEqual(fromCents(1999), 19.99);
    assert.strictEqual(fromCents(0), 0);
  });
});
