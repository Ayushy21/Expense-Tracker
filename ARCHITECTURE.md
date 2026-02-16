# Expense Tracker – Project Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  Vercel / static hosting                                         │
│  - Add expense form (with idempotency key)                        │
│  - Expense list (filter, sort, total)                             │
│  - Loading / error states                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API (HTTPS)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                   │
│  Render / Node server                                            │
│  - POST /expenses (idempotent, validation)                        │
│  - GET /expenses (filter, sort)                                   │
│  - GET /expenses/summary (total per category)                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (SQLite)                             │
│  File: data/expenses.db                                          │
│  - expenses table (id, amount_cents, category, description,       │
│    date, created_at, idempotency_key)                             │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack & Rationale

| Layer      | Choice           | Reason |
|-----------|-------------------|--------|
| Backend   | Node.js + Express | Fast to build, same language as frontend, easy to deploy on Render, large ecosystem. |
| Database  | **SQLite**        | No separate server; ACID compliant; ideal for single-user/small-scale; exact money via integer cents; easy backup (one file). Chosen over MongoDB for relational semantics and precise decimal handling. |
| Frontend  | React             | Per requirements; component-based, good for forms and lists. |
| API       | REST              | Simple, well-understood, easy to integrate with React. |

## Data Model

- **id**: UUID (primary key).
- **amount**: Stored as **integer cents** in DB (`amount_cents`) to avoid floating-point errors; API accepts/returns decimal string or number (e.g. `"19.99"`).
- **category**, **description**: Strings.
- **date**: ISO date string (e.g. `YYYY-MM-DD`).
- **created_at**: ISO timestamp (set by server).
- **idempotency_key**: Optional client-generated key (e.g. UUID) to make POST idempotent; stored uniquely so retries return the same expense.

## Idempotency (Duplicate Submissions & Retries)

- Client generates a UUID per “create expense” action and sends it in header `X-Idempotency-Key` (or body).
- Server: if an expense with that key exists, return `200` with that expense (no duplicate). Otherwise create and store the key.
- Handles: multiple submit clicks, page refresh after submit, network retries.

## API Summary

| Method | Endpoint              | Purpose |
|--------|------------------------|--------|
| POST   | /expenses              | Create expense (idempotent). Body: amount, category, description, date. Optional: idempotencyKey. |
| GET    | /expenses              | List expenses. Query: `category`, `sort=date_desc`. |
| GET    | /expenses/summary      | Total per category (nice-to-have). |

## Folder Structure

```
Expense-Tracker/
├── backend/
│   ├── src/
│   │   ├── config/       # env, constants
│   │   ├── db/           # SQLite init, migrations
│   │   ├── middleware/   # validation, error handler
│   │   ├── routes/       # expense routes
│   │   ├── controllers/  # expense controller
│   │   ├── utils/        # money, errors
│   │   └── app.js        # Express app
│   ├── server.js         # entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # ExpenseForm, ExpenseList, etc.
│   │   ├── api/          # client for backend
│   │   ├── hooks/        # useExpenses, etc.
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── ARCHITECTURE.md
└── README.md
```

## Edge Cases Handled

- **Duplicate submissions**: Idempotency key.
- **Page refresh after submit**: Same key on retry returns existing expense.
- **Slow API**: Loading states; optional request timeout/retry in client.
- **Negative amount / missing fields**: Backend validation; 400 with message.
- **Money precision**: Integer cents in DB; round when converting to/from decimal.
