import express from 'express';
import {
  createIncome,
  deleteIncome,
  getAllIncomes,
  updateIncome,
  getMonthlyIncomeSummary,
  createIncomeCategory,
  updateIncomeCategory,
  getIncomeCategories,
  deleteIncomeCategory,
} from './income.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { incomePdfController } from './income.pdf.controller';
import {
  incomeCSVController,
  incomeExcelController,
} from './income.csv.excel.controller';

const router = express.Router();
router.use(auth(USER_ROLES.USER));

router.route('/').post(createIncome).get(getAllIncomes);
router.route('/:id').patch(updateIncome).delete(deleteIncome);
router.route('/summary').get(getMonthlyIncomeSummary);

router.route('/categories').get(getIncomeCategories).post(createIncomeCategory);

router
  .route('/categories/:id')
  .patch(updateIncomeCategory)
  .delete(deleteIncomeCategory);

router.route('/pdf').get(incomePdfController);
router.route('/csv').get(incomeCSVController);
router.route('/excel').get(incomeExcelController);
export const IncomeRoutes = router;
