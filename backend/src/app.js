/**
 * Express application: CORS, JSON body, expense routes, error handler.
 */
import express from 'express';
import cors from 'cors';
import expenseRoutes from './routes/expenses.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config/index.js';

const app = express();

// CORS: allow frontend origin in production; in dev allow any for localhost
const corsOptions = config.frontendOrigin
  ? {
      origin: (origin, cb) => {
        const allowed = config.frontendOrigin.replace(/\/$/, '');
        const ok = !origin || origin === allowed || origin === allowed + '/';
        cb(null, ok);
      },
    }
  : { origin: true };
app.use(cors(corsOptions));

app.use(express.json());

// Health check (useful for Render)
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/expenses', expenseRoutes);

// 404 for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: true, message: 'Not found' });
});

app.use(errorHandler);

export default app;
