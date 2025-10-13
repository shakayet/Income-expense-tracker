import express from 'express';
import { SavingsController } from './savings.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createSavingsZodSchema } from './savings.validation';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = express.Router();


router
  .route('/')
  .post(auth(USER_ROLES.USER),validateRequest(createSavingsZodSchema), SavingsController.createSavings)
  .get(auth(USER_ROLES.USER),SavingsController.getAllSavings);

router.route('/summary').get(auth(USER_ROLES.USER),SavingsController.getSavingsSummaryByCategory);

export const SavingsRoutes = router;
