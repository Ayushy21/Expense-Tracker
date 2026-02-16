import React from 'react';

/**
 * Filter by category and sort by date (newest first).
 */
export default function Filters({ categories, selectedCategory, sortDateDesc, onCategoryChange, onSortChange }) {
  return (
    <div className="filters-bar">
      <label>
        <span>Category</span>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className={`sort-toggle ${sortDateDesc ? 'active' : ''}`}
        onClick={() => onSortChange(!sortDateDesc)}
        aria-pressed={sortDateDesc}
        aria-label="Sort by date newest first"
      >
        ↓ Newest first
      </button>
    </div>
  );
}
