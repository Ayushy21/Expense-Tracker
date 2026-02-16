import React from 'react';

/**
 * Table of expenses with total of visible items.
 */
export default function ExpenseList({ expenses, total, loading, error }) {
  if (error) {
    return (
      <div className="expense-list">
        <div className="list-error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="expense-list">
        <div className="list-loading" aria-busy="true">
          Loading expenses…
        </div>
      </div>
    );
  }

  if (!Array.isArray(expenses) || expenses.length === 0) {
    return (
      <div className="expense-list">
        <div className="list-empty">
          <div className="empty-icon" aria-hidden>📋</div>
          <p>No expenses yet</p>
          <p className="hint">Add an expense using the form.</p>
        </div>
      </div>
    );
  }

  const formatAmount = (n) => `₹${Number(n).toFixed(2)}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <section className="expense-list" aria-label="Expense list">
      <div className="list-header">Expenses</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th className="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{formatDate(e.date)}</td>
              <td>
                <span className="category-badge">{e.category}</span>
              </td>
              <td className="description">{e.description}</td>
              <td className="amount">{formatAmount(e.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="list-total">
        <span className="total-label">Total (visible)</span>
        <span>{formatAmount(total)}</span>
      </div>
    </section>
  );
}
