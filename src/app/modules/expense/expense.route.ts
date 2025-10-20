import express from 'express';
import * as expenseController from './expense.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createExpenseZodSchema, expenseUpdateSchema } from './expense.zod';
import { uploadTextAndExtractExpense } from './expense.ocr.controller';
import { getMonthlyExpenseSummary } from './expense.controller';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.use(auth(USER_ROLES.USER));

router
  .route('/')
  .post(
    validateRequest(createExpenseZodSchema),
    expenseController.createExpense
  )
  .get(expenseController.getExpenses);

router.route('/summary').get(getMonthlyExpenseSummary);


router.route('/expense-categories').get(expenseController.getExpenseCategories).post(expenseController.createExpenseCategory);
router.post('/ocr-raw', uploadTextAndExtractExpense);

router
  .route('/:id')
  .get(expenseController.getExpense) // Add this line
  .put(validateRequest(expenseUpdateSchema), expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

router.route('/categories/:id').patch(expenseController.updateExpenseCategory);

export const ExpenseRoutes = router;
