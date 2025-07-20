import express from 'express';
import { createIncome } from './income.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createIncomeZodSchema } from './income.zod';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route('/')
  .post(auth(), validateRequest(createIncomeZodSchema), createIncome);

export const IncomeRoutes = router;