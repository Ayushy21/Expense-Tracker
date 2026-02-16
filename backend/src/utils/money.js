/**
 * Money utilities: store and transmit amounts without floating-point errors.
 * Backend stores amount as integer CENTS in the database.
 */

/**
 * Parse a decimal amount (string or number) to integer cents.
 * Rounds to 2 decimal places. Throws if invalid or negative.
 * @param {string|number} value - e.g. "19.99" or 19.99
 * @returns {number} cents, e.g. 1999
 */
export function toCents(value) {
  if (value === '' || value === null || value === undefined) {
    throw new Error('Amount is required');
  }
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (Number.isNaN(num)) {
    throw new Error('Amount must be a valid number');
  }
  if (num < 0) {
    throw new Error('Amount cannot be negative');
  }
  return Math.round(num * 100);
}

/**
 * Convert integer cents to a decimal number for API responses.
 * @param {number} cents
 * @returns {number} e.g. 19.99
 */
export function fromCents(cents) {
  return Math.round(cents) / 100;
}
