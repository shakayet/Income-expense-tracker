import express from 'express';
import * as expenseController from './expense.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createExpenseZodSchema,  expenseUpdateSchema } from './expense.zod';
import * as ocrController from './expense.ocr.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { uploadTextAndExtractExpense } from './expense.ocr.controller';

const router = express.Router();


router.use(auth());


router.route('/')
  .post(validateRequest(createExpenseZodSchema), expenseController.createExpense)
  .get(expenseController.getExpenses);


router.route('/:id')
  .put(validateRequest(expenseUpdateSchema), expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

router.post('/ocr-raw', uploadTextAndExtractExpense);

export const ExpenseRoutes = router;