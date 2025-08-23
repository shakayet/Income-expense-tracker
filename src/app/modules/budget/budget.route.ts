import express from 'express';
import {
  setOrUpdateBudget,
  getBudgetDetails,
  updateBudget,
  removeBudgetCategory,
} from './budget.controller';
import validateRequest from '../../middlewares/validateRequest';
import { setBudgetZodSchema, updateBudgetZodSchema } from './budget.zod';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.use(auth(USER_ROLES.USER));

router.route('/').post(validateRequest(setBudgetZodSchema), setOrUpdateBudget);

router
  .route('/:month')
  .get(getBudgetDetails)
  .patch(validateRequest(updateBudgetZodSchema), updateBudget);

router
  .route('/:month/:category')
  .delete(removeBudgetCategory);

export const BudgetRoutes = router;