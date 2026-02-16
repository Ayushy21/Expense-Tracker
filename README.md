# Expense Tracker

A production-quality minimal full-stack personal finance tool: record and review expenses, filter by category, sort by date, and see totals (including per-category summary).

## Features

- **Add expense**: amount, category, description, date
- **List expenses**: filter by category, sort by date (newest first)
- **Total**: sum of visible (filtered) expenses
- **Summary**: total spending per category
- **Idempotent create**: duplicate submits / retries / page refresh do not create duplicate entries
- **Validation**: negative amount and required fields enforced
- **Loading & error states**: clear UX for slow or failed API

## Tech Stack

| Layer    | Choice            | Reason |
|----------|-------------------|--------|
| Backend  | Node.js + Express | Fast to build, same language as frontend, easy to deploy (e.g. Render). |
| Database | **SQLite**        | No separate server; ACID compliant; ideal for single-user/small scale; exact money via integer cents; easy backup (one file). Chosen over MongoDB for relational semantics and precise decimal handling. |
| Frontend | React (Vite)      | Per requirements; component-based, fast dev experience. |
| API      | REST              | Simple, well-understood. |

## Project Structure

```
Expense-Tracker/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── config/    # env, constants
│   │   ├── db/        # SQLite init
│   │   ├── middleware/# validation, error handler
│   │   ├── routes/    # expense routes
│   │   ├── controllers/
│   │   └── utils/     # money, errors
│   ├── server.js
│   └── package.json
├── frontend/          # React (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── api/       # API client
│   │   └── App.jsx
│   └── package.json
├── ARCHITECTURE.md
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)

### Quick start (recommended)

From the **project root** (Expense-Tracker folder), run:

```bash
npm install
npm run dev
```

This starts **both** the backend (port 3002) and frontend (port 5173). Open **http://localhost:5173** in your browser.

### Backend only

```bash
cd backend
npm install
cp .env.example .env
# Optional: set PORT=3002 in .env (default is 3002 to avoid conflicts)
npm start
```

API runs at `http://localhost:3002` by default. Database file: `backend/data/expenses.db` (created on first run).

### Frontend only

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. Vite proxies `/api` to `http://localhost:3002`, so the backend must be running on 3002.

### Run both (manual)

```bash
cd backend && npm start
```
In a second terminal:
```bash
cd frontend && npm run dev
```
Then open `http://localhost:5173`.

## API

| Method | Endpoint           | Description |
|--------|--------------------|-------------|
| POST   | /expenses          | Create expense. Body: `amount`, `category`, `description`, `date`. Optional header: `X-Idempotency-Key` (or body `idempotencyKey`) for safe retries. |
| GET    | /expenses          | List expenses. Query: `category` (filter), `sort=date_desc` (newest first). |
| GET    | /expenses/summary  | Total per category and grand total. |
| GET    | /health            | Health check. |

## Design Decisions

1. **Money as integer cents**  
   Stored and computed in cents to avoid floating-point errors. API accepts/returns decimal (e.g. `19.99`).

2. **Idempotency**  
   Client sends a unique key per “add expense” action (e.g. UUID). Same key on retry returns the existing expense (200) instead of creating a duplicate. Handles double-clicks, refresh-after-submit, and network retries.

3. **SQLite**  
   No separate DB server; ACID; one file for backup/portability; sufficient for single-user/small team. MongoDB would be an option for document-style or very high scale; for this app SQLite is simpler and keeps money math precise.

4. **Validation**  
   Backend validates amount (required, non-negative), date (YYYY-MM-DD), and required fields. Returns 400 with a clear message.

## Trade-offs & Omissions

- **Timebox**: No auth (single-user assumption). No pagination (list is small). No rate limiting.
- **Intentionally not done**: OAuth, multi-tenant, mobile app, PWA offline.
- **Tests**: Unit tests for money utils; integration tests for POST/GET/idempotency. No E2E or frontend tests in this repo.

## Deployment

### Backend (Render)

1. Create a **Web Service** on [Render](https://render.com).
2. Connect your repo; set root directory to `backend` (or build command to run from backend).
3. **Build**: `npm install`
4. **Start**: `npm start`
5. **Environment**:
   - `NODE_ENV=production`
   - `PORT` (Render sets this)
   - `FRONTEND_ORIGIN=https://your-frontend.vercel.app` (your frontend URL for CORS)
   - Optional: `DB_PATH` (default: `./data/expenses.db`; on Render use a persistent disk or leave default and accept ephemeral DB unless you add a volume)
6. Deploy. Note the backend URL (e.g. `https://your-api.onrender.com`).

**Note**: Render free tier may spin down; first request after idle can be slow. For a persistent SQLite DB on Render you need a persistent disk (paid) or an external DB.

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com); import your repo.
2. **Root Directory**: `frontend`
3. **Build**: `npm run build`
4. **Output**: default (Vite uses `dist`)
5. **Environment**: add `VITE_API_URL=https://your-api.onrender.com` (no trailing slash) so the frontend calls your deployed API.
6. Deploy. Your app will be at `https://your-app.vercel.app`.

### Post-deploy

- Open the Vercel app URL; add an expense and confirm list, filter, sort, and total work.
- If you see CORS errors, ensure `FRONTEND_ORIGIN` on the backend matches the Vercel URL exactly (including `https://`).

## Scripts

**Backend**

- `npm start` – run API
- `npm run dev` – run with watch
- `npm test` – unit tests (money utils)
- `npm run test:integration` – API integration tests (uses temp DB)

**Frontend**

- `npm run dev` – dev server
- `npm run build` – production build
- `npm run preview` – preview production build

## License

MIT.
