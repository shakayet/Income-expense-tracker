import express from 'express';
import * as InAppPurchaseController from './inAppPurchase.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// SubscriptionPlan CRUD
router.post(
  '/plans',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  InAppPurchaseController.createSubscriptionPlan
);
router.get('/plans', InAppPurchaseController.getAllSubscriptionPlans);
router.get('/plans/:id', InAppPurchaseController.getSubscriptionPlanById);
router.patch(
  '/plans/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  InAppPurchaseController.updateSubscriptionPlan
);
router.delete(
  '/plans/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  InAppPurchaseController.deleteSubscriptionPlan
);

// InAppSubscription CRUD
router.post(
  '/subscriptions',
  auth(USER_ROLES.USER),
  InAppPurchaseController.createInAppSubscription
);
router.get(
  '/subscriptions',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  InAppPurchaseController.getAllInAppSubscriptions
);
router.get(
  '/subscriptions/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  InAppPurchaseController.getInAppSubscriptionById
);
router.patch(
  '/subscriptions/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  InAppPurchaseController.updateInAppSubscription
);
router.delete(
  '/subscriptions/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  InAppPurchaseController.deleteInAppSubscription
);

export const InAppPurchaseRoutes = router;
