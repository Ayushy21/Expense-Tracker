import React, { useState, useRef, useEffect } from 'react';

/**
 * Form to add a new expense. Uses idempotency key to prevent duplicates on retry.
 * Submit button is disabled while submitting to avoid double-clicks.
 * resetIdempotencyTrigger: when this prop changes (e.g. after success), we clear the key so next submit gets a new one.
 */
export default function ExpenseForm({ onSubmit, loading, error, resetIdempotencyTrigger }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const idempotencyKeyRef = useRef(null);

  useEffect(() => {
    if (resetIdempotencyTrigger != null) idempotencyKeyRef.current = null;
  }, [resetIdempotencyTrigger]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const key = idempotencyKeyRef.current || crypto.randomUUID();
    idempotencyKeyRef.current = key;

    onSubmit({
      amount: parseFloat(amount),
      category: category.trim(),
      description: description.trim(),
      date: date.trim(),
      idempotencyKey: key,
    });
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    idempotencyKeyRef.current = null;
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form" aria-label="Add expense">
      <h2>Add Expense</h2>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="amount">Amount *</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="form-row form-row-full">
          <label htmlFor="category">Category *</label>
          <input
            id="category"
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Food, Transport, Shopping"
            disabled={loading}
          />
        </div>
        <div className="form-row form-row-full">
          <label htmlFor="description">Description *</label>
          <input
            id="description"
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this expense for?"
            disabled={loading}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Adding…' : 'Add Expense'}
        </button>
        <button type="button" onClick={resetForm} disabled={loading}>
          Clear
        </button>
      </div>
    </form>
  );
}
