import express from 'express';
import { SavingsController } from './savings.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createSavingsZodSchema } from './savings.validation';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { savingsPdfController } from './savings.pdf.controller';
import {
  savingsCSVController,
  savingsExcelController,
} from './savings.csv.excel.controller';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.USER),
    validateRequest(createSavingsZodSchema),
    SavingsController.createSavings
  )
  .get(auth(USER_ROLES.USER), SavingsController.getAllSavings);

router
  .route('/summary')
  .get(auth(USER_ROLES.USER), SavingsController.getSavingsSummaryByCategory);

router.route('/pdf').get(auth(USER_ROLES.USER), savingsPdfController);
router.route('/csv').get(auth(USER_ROLES.USER), savingsCSVController);
router.route('/excel').get(auth(USER_ROLES.USER), savingsExcelController);

export const SavingsRoutes = router;
