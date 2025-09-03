import express from 'express';
import {
  setOrUpdateBudget,
  getBudgetDetails,
  addBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  setMonthlyBudget,
  updateMonthlyBudget,
} from './budget.controller';
import validateRequest from '../../middlewares/validateRequest';
import {
  setBudgetZodSchema,
  addBudgetCategoryZodSchema,
  updateBudgetCategoryZodSchema,
  // setMonthlyBudgetZodSchema,
  updateMonthlyBudgetZodSchema,
} from './budget.zod';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.use(auth(USER_ROLES.USER));

router
  .route('/monthly')
  .post(setMonthlyBudget);

router
  .route('/monthly/:month')
  .patch(validateRequest(updateMonthlyBudgetZodSchema), updateMonthlyBudget);

router.route('/').post(validateRequest(setBudgetZodSchema), setOrUpdateBudget);
router.route('/:month').get(getBudgetDetails);

router
  .route('/:month/category')
  .post(validateRequest(addBudgetCategoryZodSchema), addBudgetCategory);

router
  .route('/:month/category/:category')
  .patch(validateRequest(updateBudgetCategoryZodSchema), updateBudgetCategory)
  .delete(deleteBudgetCategory);

export const BudgetRoutes = router;
