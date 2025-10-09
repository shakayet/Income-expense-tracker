import express from 'express';
import {
  createIncome,
  deleteIncome,
  getAllIncomes,
  updateIncome,
  getMonthlyIncomeSummary,
} from './income.controller';
// import validateRequest from '../../middlewares/validateRequest';
// import { createIncomeZodSchema } from './income.zod';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();
router.use(auth(USER_ROLES.USER));

router.route('/').post(createIncome).get(getAllIncomes);

router.route('/:id').patch(updateIncome).delete(deleteIncome);

router.route('/summary').get(getMonthlyIncomeSummary);

export const IncomeRoutes = router;
