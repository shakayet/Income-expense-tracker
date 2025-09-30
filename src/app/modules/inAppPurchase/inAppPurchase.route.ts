import { Router } from 'express';
import { SubscriptionController } from './inAppPurchase.controller';
// import { SubscriptionController } from '../controllers/subscriptionController';

const router = Router();
const subscriptionController = new SubscriptionController();

router.post('/', subscriptionController.createSubscription);
router.get('/', subscriptionController.getAllSubscriptions);
router.get('/user/:userId', subscriptionController.getSubscriptionByUser);
router.put('/user/:userId', subscriptionController.updateSubscription);
router.post(
  '/user/:userId/activate',
  subscriptionController.activateSubscription
);
router.post('/user/:userId/cancel', subscriptionController.cancelSubscription);
router.get(
  '/user/:userId/status',
  subscriptionController.checkSubscriptionStatus
);
// router.post('inapp-success', subscriptionController.handleInAppPurchaseSuccess);

export default router;
