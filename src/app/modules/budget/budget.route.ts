import express from 'express';
import {
  setOrUpdateBudget,
  updateBudget,
  deleteBudget,
  getBudgetDetails,
  postAccumulativeBudget,
  addBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  setMonthlyBudget,
  updateMonthlyBudget,
  getMonthlyBudgetAndMonth,
  getMonthlySummary,
  getSimpleBudgetDetails,
  postSimpleBudgetDetails,
} from './budget.controller';
import validateRequest from '../../middlewares/validateRequest';
import {
  setBudgetZodSchema,
  addBudgetCategoryZodSchema,
  updateBudgetCategoryZodSchema,
  // setMonthlyBudgetZodSchema,
  updateMonthlyBudgetZodSchema,
  updateBudgetZodSchema,
} from './budget.zod';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.use(auth(USER_ROLES.USER));

// Route to get only monthly budget and month for a user
router.get('/monthly-budget', getMonthlyBudgetAndMonth);

router.route('/monthly').post(setMonthlyBudget);

// Accumulative POST for current month: body { category: string, amount: number }
router.route('/current').post(postAccumulativeBudget); // -------> actual working route

// Monthly summary: GET /budgets/monthly/:month
router.route('/monthly/:month').get(getMonthlySummary);

router.route('/simple-monthly-budget').post(postSimpleBudgetDetails);
router.route('/simple-monthly-budget').get(getSimpleBudgetDetails); // --------> actual working route

router
  .route('/monthly/:month')
  .patch(validateRequest(updateMonthlyBudgetZodSchema), updateMonthlyBudget);

router.route('/').post(validateRequest(setBudgetZodSchema), setOrUpdateBudget);
router
  .route('/:month')
  .get(getBudgetDetails)
  .put(validateRequest(updateBudgetZodSchema), updateBudget)
  .delete(deleteBudget); //actual working route

router
  .route('/:month/category')
  .post(validateRequest(addBudgetCategoryZodSchema), addBudgetCategory);

router
  .route('/:month/category/:category')
  .patch(validateRequest(updateBudgetCategoryZodSchema), updateBudgetCategory)
  .delete(deleteBudgetCategory);

export const BudgetRoutes = router;
