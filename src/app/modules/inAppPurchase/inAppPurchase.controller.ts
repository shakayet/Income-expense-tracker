// // inAppPurchase.controller.ts
// import { Request, Response } from 'express';
// import * as InAppPurchaseService from './inAppPurchase.service';

// // SubscriptionPlan CRUD
// export const createSubscriptionPlan = catchAsync(
//   async (req: UserRequest, res: Response) => {
//     const { error } = validateSubscriptionPlan(req.body);
//     if (error) throw new AppError(error.details[0].message, 400);

//     const plan = await InAppPurchaseService.createSubscriptionPlan({
//       ...req.body,
//       createdBy: req.user._id,
//     });
//     res.status(201).json({ success: true, data: plan });
//   }
// );

// export const getAllSubscriptionPlans = catchAsync(
//   async (_req: Request, res: Response) => {
//     const plans = await InAppPurchaseService.getAllSubscriptionPlans();
//     res.json({ success: true, data: plans });
//   }
// );

// export const getSubscriptionPlanById = catchAsync(
//   async (req: Request, res: Response) => {
//     const plan = await InAppPurchaseService.getSubscriptionPlanById(
//       req.params.id
//     );
//     if (!plan) throw new AppError('Subscription plan not found', 404);
//     res.json({ success: true, data: plan });
//   }
// );

// export const updateSubscriptionPlan = catchAsync(
//   async (req: UserRequest, res: Response) => {
//     const { error } = validateSubscriptionPlan(req.body);
//     if (error) throw new AppError(error.details[0].message, 400);

//     const plan = await InAppPurchaseService.updateSubscriptionPlan(
//       req.params.id,
//       { ...req.body, updatedBy: req.user._id }
//     );
//     if (!plan) throw new AppError('Subscription plan not found', 404);
//     res.json({ success: true, data: plan });
//   }
// );

// export const deleteSubscriptionPlan = catchAsync(
//   async (req: Request, res: Response) => {
//     const plan = await InAppPurchaseService.deleteSubscriptionPlan(
//       req.params.id
//     );
//     if (!plan) throw new AppError('Subscription plan not found', 404);
//     res.json({
//       success: true,
//       message: 'Subscription plan deleted successfully',
//     });
//   }
// );

// // InAppSubscription CRUD
// export const createInAppSubscription = catchAsync(
//   async (req: UserRequest, res: Response) => {
//     const { error } = validateInAppSubscription(req.body);
//     if (error) throw new AppError(error.details[0].message, 400);

//     const sub = await InAppPurchaseService.createInAppSubscription({
//       ...req.body,
//       user: req.user._id,
//       createdBy: req.user._id,
//     });
//     res.status(201).json({ success: true, data: sub });
//   }
// );

// export const getAllInAppSubscriptions = catchAsync(
//   async (req: Request, res: Response) => {
//     const subs = await InAppPurchaseService.getAllInAppSubscriptions();
//     res.json({ success: true, data: subs });
//   }
// );

// export const getInAppSubscriptionById = catchAsync(
//   async (req: UserRequest, res: Response) => {
//     const sub = await InAppPurchaseService.getInAppSubscriptionById(
//       req.params.id
//     );
//     if (!sub) throw new AppError('Subscription not found', 404);

//     // Check if user owns the subscription or is admin
//     if (
//       req.user.role === 'user' &&
//       sub.user.toString() !== req.user._id.toString()
//     ) {
//       throw new AppError('Access denied', 403);
//     }

//     res.json({ success: true, data: sub });
//   }
// );

// export const updateInAppSubscription = catchAsync(
//   async (req: UserRequest, res: Response) => {
//     const { error } = validateInAppSubscription(req.body, true);
//     if (error) throw new AppError(error.details[0].message, 400);

//     // Check ownership if user is not admin
//     if (req.user.role === 'user') {
//       const existingSub = await InAppPurchaseService.getInAppSubscriptionById(
//         req.params.id
//       );
//       if (!existingSub) throw new AppError('Subscription not found', 404);
//       if (existingSub.user.toString() !== req.user._id.toString()) {
//         throw new AppError('Access denied', 403);
//       }
//     }

//     const sub = await InAppPurchaseService.updateInAppSubscription(
//       req.params.id,
//       { ...req.body, updatedBy: req.user._id }
//     );
//     if (!sub) throw new AppError('Subscription not found', 404);
//     res.json({ success: true, data: sub });
//   }
// );

// export const deleteInAppSubscription = catchAsync(
//   async (req: Request, res: Response) => {
//     const sub = await InAppPurchaseService.deleteInAppSubscription(
//       req.params.id
//     );
//     if (!sub) throw new AppError('Subscription not found', 404);
//     res.json({ success: true, message: 'Subscription deleted successfully' });
//   }
// );

// // Webhook handler for payment providers
// export const handlePaymentWebhook = catchAsync(
//   async (req: Request, res: Response) => {
//     const signature =
//       req.headers['stripe-signature'] || req.headers['paypal-transmission-id'];
//     const payload = req.body;

//     const result = await InAppPurchaseService.processPaymentWebhook(
//       payload,
//       signature as string
//     );

//     if (result.success) {
//       res.status(200).json({ received: true });
//     } else {
//       res.status(400).json({ received: false, error: result.error });
//     }
//   }
// );
