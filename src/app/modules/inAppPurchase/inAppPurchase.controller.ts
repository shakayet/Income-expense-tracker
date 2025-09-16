// export const getSubscriptionPlanById = async (req: Request, res: Response) =>
//   res.status(501).json({ message: 'Not implemented' });
// import { Request, Response } from 'express';
// // --- STUBS for missing controller functions ---
// // These stubs allow the app to compile and return 501 Not Implemented for missing endpoints.
// export const createSubscriptionPlan = async (req: Request, res: Response) =>
//   res.status(501).json({ message: 'Not implemented' });
// export const updateSubscriptionPlan = async (req: Request, res: Response) =>
//   res.status(501).json({ message: 'Not implemented' });
// export const deleteSubscriptionPlan = async (req: Request, res: Response) =>
//   res.status(501).json({ message: 'Not implemented' });
// export const createInAppSubscription = async (req: Request, res: Response) =>
//   res.status(501).json({ message: 'Not implemented' });
// export const getAllInAppSubscriptions = async (req: Request, res: Response) =>
//   res.status(501).json({ message: 'Not implemented' });
// export const getInAppSubscriptionById = async (req: Request, res: Response) =>
//   res.status(501).json({ message: 'Not implemented' });
// export const updateInAppSubscription = async (req: Request, res: Response) =>
//   res.status(501).json({ message: 'Not implemented' });
// export const deleteInAppSubscription = async (req: Request, res: Response) =>
//   res.status(501).json({ message: 'Not implemented' });
// import * as InAppPurchaseService from './inAppPurchase.service';
// import catchAsync from '../../../shared/catchAsync';
// // TODO: Restore this import when the file exists
// // import ApiError from '../../errors/ApiError';

// // Get all subscription plans
// export const getAllSubscriptionPlans = async (req: Request, res: Response) => {
//   try {
//     const plans = await InAppPurchaseService.getAllSubscriptionPlans();
//     return res.status(200).json({ success: true, plans });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch plans',
//       error: error instanceof Error ? error.message : error,
//     });
//   }
// };

// // Validate Apple in-app purchase receipt
// export const validateAppleReceipt = async (req: Request, res: Response) => {
//   try {
//     const { receipt, userId, planId } = req.body;
//     if (!receipt || !userId || !planId) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Missing required fields' });
//     }
//     const result = await InAppPurchaseService.verifyAppStorePurchase(
//       receipt,
//       userId,
//       planId
//     );
//     if (result.success) {
//       return res
//         .status(200)
//         .json({ success: true, subscription: result.subscription });
//     } else {
//       return res.status(400).json({ success: false, message: result.error });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error instanceof Error ? error.message : 'Internal server error',
//     });
//   }
// };

// // Validate Google Play in-app purchase token
// export const validateGoogleToken = async (req: Request, res: Response) => {
//   try {
//     const { purchaseToken, userId, planId } = req.body;
//     if (!purchaseToken || !userId || !planId) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Missing required fields' });
//     }
//     const result = await InAppPurchaseService.verifyGooglePlayPurchase(
//       purchaseToken,
//       userId,
//       planId
//     );
//     if (result.success) {
//       return res
//         .status(200)
//         .json({ success: true, subscription: result.subscription });
//     } else {
//       return res.status(400).json({ success: false, message: result.error });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error instanceof Error ? error.message : 'Internal server error',
//     });
//   }
// };

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
