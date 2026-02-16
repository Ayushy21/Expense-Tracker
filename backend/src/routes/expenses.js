/**
 * Expense API routes.
 */
import { Router } from 'express';
import { validateCreateExpense } from '../middleware/validateExpense.js';
import { createExpense, listExpenses, getSummary } from '../controllers/expenseController.js';

const router = Router();

router.post('/', validateCreateExpense, createExpense);
router.get('/', listExpenses);
router.get('/summary', getSummary);

export default router;
