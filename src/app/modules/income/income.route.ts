import express from 'express';
import { createIncome } from './income.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createIncomeZodSchema } from './income.zod';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();
router.use(auth(USER_ROLES.USER));

router.route('/')
  .post(validateRequest(createIncomeZodSchema), createIncome);

export const IncomeRoutes = router;