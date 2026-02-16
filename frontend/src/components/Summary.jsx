import React from 'react';

/**
 * Simple dashboard: total per category and grand total.
 */
export default function Summary({ byCategory, total, loading, error }) {
  if (error) return <div className="summary-error">{error}</div>;
  if (loading) return <div className="summary-loading">Loading summary…</div>;
  if (!Array.isArray(byCategory) || byCategory.length === 0) return null;

  const formatAmount = (n) => `₹${Number(n).toFixed(2)}`;

  return (
    <section className="summary" aria-label="Spending summary">
      <h3>Spending by category</h3>
      <ul>
        {byCategory.map(({ category, total: t }) => (
          <li key={category}>
            <span className="cat-name">{category}</span>
            <span className="cat-amount">{formatAmount(t)}</span>
          </li>
        ))}
      </ul>
      <div className="summary-total">
        <strong>Total</strong>
        <span>{formatAmount(total)}</span>
      </div>
    </section>
  );
}
