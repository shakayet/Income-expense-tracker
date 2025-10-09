import express from 'express';
import * as expenseController from './expense.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createExpenseZodSchema, expenseUpdateSchema } from './expense.zod';
import { uploadTextAndExtractExpense } from './expense.ocr.controller';
import { getMonthlyExpenseSummary } from './expense.controller';

const router = express.Router();

router.use(auth());

router
  .route('/')
  .post(
    validateRequest(createExpenseZodSchema),
    expenseController.createExpense
  )
  .get(expenseController.getExpenses);

router.route('/summary').get(getMonthlyExpenseSummary);

router
  .route('/:id')
  .get(expenseController.getExpense) // Add this line
  .put(validateRequest(expenseUpdateSchema), expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

router.post('/ocr-raw', uploadTextAndExtractExpense);

export const ExpenseRoutes = router;
