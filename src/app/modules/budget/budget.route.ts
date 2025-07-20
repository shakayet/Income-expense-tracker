import express from 'express';
import { setOrUpdateBudget, getBudgetDetails, updateBudget } from './budget.controller';
import validateRequest from '../../middlewares/validateRequest';
import { setBudgetZodSchema } from './budget.zod';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.use(auth(USER_ROLES.USER));

router.route('/')
  .post(validateRequest(setBudgetZodSchema), setOrUpdateBudget);

router.route('/:month')
  .get(getBudgetDetails);
  .patch(validateRequest(updateBudgetZodSchema), updateBudget);

export const BudgetRoutes = router;