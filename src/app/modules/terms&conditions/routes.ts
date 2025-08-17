import express from 'express';
import { TermsController } from './controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), // Only Admin & Super-Admin can create T&C
    TermsController.createTerms
  )
  .get(TermsController.getAllTerms); // Get all versions

router.route('/latest').get(TermsController.getLatestTerms);

export const TermsRoutes = router;
