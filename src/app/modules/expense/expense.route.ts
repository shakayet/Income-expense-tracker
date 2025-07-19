import express from 'express';
import * as expenseController from './expense.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { expenseCreateSchema, expenseUpdateSchema } from './expense.zod';
import * as ocrController from './expense.ocr.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();


router.use(auth());


router.route('/')
  .post(validateRequest(expenseCreateSchema), expenseController.createExpense)
  .get(expenseController.getExpenses);


router.route('/:id')
  .put(validateRequest(expenseUpdateSchema), expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

router.route('/ocr-upload')
  .post(fileUploadHandler(), ocrController.uploadReceipt);

export const ExpenseRoutes = router;