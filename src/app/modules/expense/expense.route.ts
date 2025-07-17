import express from 'express';
import * as expenseController from './expense.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.use(auth());

router.post('/', expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

export default router;