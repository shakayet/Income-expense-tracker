import { Router } from 'express';
import { SubscriptionPlanController } from './controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();
const subscriptionPlanController = new SubscriptionPlanController();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  subscriptionPlanController.createSubscriptionPlan
);
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  subscriptionPlanController.getAllSubscriptionPlans
);
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  subscriptionPlanController.getSubscriptionPlanById
);
router.put(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  subscriptionPlanController.updateSubscriptionPlan
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  subscriptionPlanController.deleteSubscriptionPlan
);

export const SubscriptionPlan = router;
