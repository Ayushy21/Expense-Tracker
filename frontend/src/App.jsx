import React, { useState, useEffect, useCallback } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Filters from './components/Filters';
import Summary from './components/Summary';
import { createExpense, listExpenses, getSummary } from './api/client';
import './App.css';

/**
 * Main app: form, filters, list, total, summary.
 * Handles loading/error states and refetch after create (idempotent retries safe).
 */
export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ byCategory: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortDateDesc, setSortDateDesc] = useState(true);
  const [categories, setCategories] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [formResetTrigger, setFormResetTrigger] = useState(0);

  const fetchExpenses = useCallback(async () => {
    setListError(null);
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (sortDateDesc) params.sort = 'date_desc';
      const { expenses: list } = await listExpenses(params);
      const safeList = Array.isArray(list) ? list : [];
      setExpenses(safeList);
      // Populate category filter options from list + existing
      const cats = [...new Set(safeList.map((e) => e.category).filter(Boolean))];
      setCategories((prev) => [...new Set([...prev, ...cats])].sort());
    } catch (e) {
      setListError(e.message || 'Failed to load expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, sortDateDesc]);

  const fetchSummary = useCallback(async () => {
    setSummaryError(null);
    setSummaryLoading(true);
    try {
      const data = await getSummary();
      setSummary(data);
      if (data.byCategory?.length) {
        setCategories((prev) => {
          const cats = new Set(prev);
          data.byCategory.forEach(({ category }) => cats.add(category));
          return [...cats].sort();
        });
      }
    } catch (e) {
      setSummaryError(e.message || 'Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleSubmit = async (payload) => {
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      await createExpense(payload);
      setFormResetTrigger((t) => t + 1);
      await Promise.all([fetchExpenses(), fetchSummary()]);
      setSubmitError(null);
    } catch (e) {
      setSubmitError(e.body?.message || e.message || 'Failed to add expense');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Expense Tracker</h1>
        <p>Track spending by category and see where your money goes.</p>
      </header>
      <aside className="app-sidebar">
        <ExpenseForm
          onSubmit={handleSubmit}
          loading={submitLoading}
          error={submitError}
          resetIdempotencyTrigger={formResetTrigger}
        />
        <Summary
          byCategory={summary.byCategory}
          total={summary.total}
          loading={summaryLoading}
          error={summaryError}
        />
      </aside>
      <main className="app-main-list">
        <Filters
          categories={categories}
          selectedCategory={categoryFilter}
          sortDateDesc={sortDateDesc}
          onCategoryChange={setCategoryFilter}
          onSortChange={setSortDateDesc}
        />
        <ExpenseList
          expenses={expenses}
          total={total}
          loading={loading}
          error={listError}
        />
      </main>
    </div>
  );
}
