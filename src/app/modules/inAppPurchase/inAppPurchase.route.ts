// import express from 'express';
// import * as InAppPurchaseController from './inAppPurchase.controller';
// import auth from '../../middlewares/auth';
// import { USER_ROLES } from '../../../enums/user';
// import { rawBodyMiddleware } from '../../middlewares/rawBody.middleware';

// const router = express.Router();

// // Native in-app purchase validation endpoints
// router.post(
//   '/iap/validate/apple',
//   InAppPurchaseController.validateAppleReceipt
// );
// router.post(
//   '/iap/validate/google',
//   InAppPurchaseController.validateGoogleToken
// );
// // SubscriptionPlan CRUD
// router.post(
//   '/plans',
//   auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
//   InAppPurchaseController.createSubscriptionPlan
// );
// router.get('/plans', InAppPurchaseController.getAllSubscriptionPlans);
// router.get('/plans/:id', InAppPurchaseController.getSubscriptionPlanById);
// router.patch(
//   '/plans/:id',
//   auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
//   InAppPurchaseController.updateSubscriptionPlan
// );
// router.delete(
//   '/plans/:id',
//   auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
//   InAppPurchaseController.deleteSubscriptionPlan
// );
// // InAppSubscription CRUD
// router.post(
//   '/subscriptions',
//   auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
//   InAppPurchaseController.createInAppSubscription
// );
// router.get(
//   '/subscriptions',
//   auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
//   InAppPurchaseController.getAllInAppSubscriptions
// );
// router.get(
//   '/subscriptions/:id',
//   auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
//   InAppPurchaseController.getInAppSubscriptionById
// );
// router.patch(
//   '/subscriptions/:id',
//   auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
//   InAppPurchaseController.updateInAppSubscription
// );
// router.delete(
//   '/subscriptions/:id',
//   auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
//   InAppPurchaseController.deleteInAppSubscription
// );
// // Webhook endpoints for payment providers
// router.post(
//   '/webhook/stripe',
//   express.raw({ type: 'application/json' }),
//   InAppPurchaseController.handlePaymentWebhook
// );
// router.post(
//   '/webhook/paypal',
//   rawBodyMiddleware,
//   InAppPurchaseController.handlePaymentWebhook
// );

// export const InAppPurchaseRoutes = router;
