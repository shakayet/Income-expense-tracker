import { Router } from 'express';
import { SubscriptionPlanController } from './controller';

const router = Router();
const subscriptionPlanController = new SubscriptionPlanController();

// POST /api/subscription-plans - Create new subscription plan
router.post('/', subscriptionPlanController.createSubscriptionPlan);

// GET /api/subscription-plans - Get all subscription plans
router.get('/', subscriptionPlanController.getAllSubscriptionPlans);

// GET /api/subscription-plans/:id - Get subscription plan by ID
router.get('/:id', subscriptionPlanController.getSubscriptionPlanById);

// PUT /api/subscription-plans/:id - Update subscription plan
router.put('/:id', subscriptionPlanController.updateSubscriptionPlan);

// DELETE /api/subscription-plans/:id - Delete subscription plan
router.delete('/:id', subscriptionPlanController.deleteSubscriptionPlan);

export default router;
