import express from 'express';
import { SavingsController } from './savings.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createSavingsZodSchema } from './savings.validation';

const router = express.Router();

router
  .route('/')
  .post(validateRequest(createSavingsZodSchema), SavingsController.createSavings)
  .get(SavingsController.getAllSavings);

router.route('/summary').get(SavingsController.getSavingsSummaryByCategory);

export const SavingsRoutes = router;
