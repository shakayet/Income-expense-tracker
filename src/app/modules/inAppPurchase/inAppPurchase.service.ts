// /* eslint-disable no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from 'axios';
// import * as dotenv from 'dotenv';
// import { Types } from 'mongoose';
// import process from 'process';
// import { InAppSubscription, SubscriptionPlan } from './inAppPurchase.model';
// import {
//   ISubscriptionPlan,
//   IInAppSubscription,
//   SubscriptionPlatform,
//   SubscriptionStatus,
//   WebhookResult,
// } from './inAppPurchase.interface';
// import { StripeService } from '../../../stripe/stripe.service';
// import { AppleIAPService } from '../apple/appleIAP.service';
// import { GoogleIAPService } from '../google/googleIAP.service';
// dotenv.config();

// // SubscriptionPlan CRUD
// export const createSubscriptionPlan = async (
//   payload: Omit<ISubscriptionPlan, 'createdAt' | 'updatedAt'>
// ) => {
//   return SubscriptionPlan.create(payload);
// };

// export const getAllSubscriptionPlans = async (
//   filters: { isActive?: boolean } = {}
// ) => {
//   const query: any = {};
//   if (filters.isActive !== undefined) query.isActive = filters.isActive;

//   return SubscriptionPlan.find(query).sort({ price: 1 });
// };

// export const getSubscriptionPlanById = async (id: string) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return SubscriptionPlan.findById(id);
// };

// export const updateSubscriptionPlan = async (
//   id: string,
//   payload: Partial<ISubscriptionPlan>
// ) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return SubscriptionPlan.findByIdAndUpdate(id, payload, {
//     new: true,
//     runValidators: true,
//   });
// };

// export const deleteSubscriptionPlan = async (id: string) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return SubscriptionPlan.findByIdAndDelete(id);
// };

// // InAppSubscription CRUD
// export const createInAppSubscription = async (
//   payload: Omit<IInAppSubscription, 'createdAt' | 'updatedAt'>
// ) => {
//   return InAppSubscription.create(payload);
// };

// export const getAllInAppSubscriptions = async (
//   filters: { user?: string; isActive?: boolean } = {}
// ) => {
//   const query: any = {};
//   if (filters.user) query.user = filters.user;
//   if (filters.isActive !== undefined) query.isActive = filters.isActive;

//   return InAppSubscription.find(query)
//     .populate('user', 'name email')
//     .populate('plan', 'name price durationDays')
//     .sort({ createdAt: -1 });
// };

// export const getInAppSubscriptionById = async (id: string) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return InAppSubscription.findById(id)
//     .populate('user', 'name email')
//     .populate('plan', 'name price durationDays');
// };

// export const getInAppSubscriptionByUser = async (userId: string) => {
//   if (!Types.ObjectId.isValid(userId)) return null;
//   return InAppSubscription.findOne({ user: userId })
//     .populate('plan', 'name price durationDays')
//     .sort({ createdAt: -1 });
// };

// export const updateInAppSubscription = async (
//   id: string,
//   payload: Partial<IInAppSubscription>
// ) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return InAppSubscription.findByIdAndUpdate(id, payload, {
//     new: true,
//     runValidators: true,
//   })
//     .populate('user', 'name email')
//     .populate('plan', 'name price durationDays');
// };

// export const deleteInAppSubscription = async (id: string) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return InAppSubscription.findByIdAndDelete(id);
// };

// // Business logic methods
// export const processPaymentWebhook = async (
//   payload: any,
//   signature: string
// ): Promise<WebhookResult> => {
//   try {
//     // Determine the payment provider from the payload or signature
//     let verifiedPayload;
//     let platform: SubscriptionPlatform;

//     if (signature.includes('stripe')) {
//       platform = SubscriptionPlatform.STRIPE;
//       verifiedPayload = await StripeService.verifyWebhook(payload, signature);
//     } else if (
//       payload.event_type &&
//       payload.event_type.includes('PAYMENT.SALE')
//     ) {
//       platform = SubscriptionPlatform.PAYPAL;
//       verifiedPayload = payload; // PayPal verification would happen here
//     } else {
//       return { success: false, error: 'Unsupported payment provider' };
//     }

//     // Process based on event type
//     const eventType = verifiedPayload.type || verifiedPayload.event_type;
//     const subscriptionId =
//       verifiedPayload.data?.object?.id ||
//       verifiedPayload.resource?.billing_agreement_id;

//     if (!subscriptionId) {
//       return { success: false, error: 'No subscription ID found in webhook' };
//     }

//     // Find the subscription in our database
//     const subscription = await InAppSubscription.findOne({
//       $or: [
//         { stripeSubscriptionId: subscriptionId },
//         { paypalSubscriptionId: subscriptionId },
//       ],
//     }).populate('plan');

//     if (!subscription) {
//       return { success: false, error: 'Subscription not found in database' };
//     }

//     // Ensure plan is populated
//     let plan: ISubscriptionPlan | null = null;
//     if (subscription.plan && typeof subscription.plan === 'object' && 'durationDays' in subscription.plan && 'name' in subscription.plan && 'price' in subscription.plan && 'planId' in subscription.plan) {
//       plan = subscription.plan as ISubscriptionPlan;
//     } else if (subscription.plan) {
//       plan = await SubscriptionPlan.findById(subscription.plan) as ISubscriptionPlan | null;
//     }

//     if (!plan || !('durationDays' in plan)) {
//       return { success: false, error: 'Plan not found or invalid' };
//     }

//     // Update subscription based on event type
//     switch (eventType) {
//       case 'invoice.payment_succeeded':
//       case 'PAYMENT.SALE.COMPLETED':
//         await updateSubscriptionStatus(
//           subscription._id.toString(),
//           SubscriptionStatus.ACTIVE,
//           new Date(),
//           new Date(
//             Date.now() + plan.durationDays * 24 * 60 * 60 * 1000
//           )
//         );
//         break;

//       case 'customer.subscription.deleted':
//       case 'BILLING.SUBSCRIPTION.CANCELLED':
//         await updateSubscriptionStatus(
//           subscription._id.toString(),
//           SubscriptionStatus.CANCELLED,
//           null,
//           null,
//           new Date()
//         );
//         break;

//       case 'invoice.payment_failed':
//       case 'PAYMENT.SALE.DENIED':
//         await updateSubscriptionStatus(
//           subscription._id.toString(),
//           SubscriptionStatus.PAST_DUE
//         );
//         break;
//     }

//     return { success: true, subscription };
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     return { success: false, error: errorMessage };
//   }
// };

// export const updateSubscriptionStatus = async (
//   subscriptionId: string,
//   status: SubscriptionStatus,
//   startedAt?: Date | null,
//   expiresAt?: Date | null,
//   cancelledAt?: Date | null
// ) => {
//   const updateData: any = {
//     status,
//     isActive:
//       status === SubscriptionStatus.ACTIVE ||
//       status === SubscriptionStatus.IN_TRIAL,
//   };

//   if (startedAt !== undefined) updateData.startedAt = startedAt;
//   if (expiresAt !== undefined) updateData.expiresAt = expiresAt;
//   if (cancelledAt !== undefined) updateData.cancelledAt = cancelledAt;

//   return updateInAppSubscription(subscriptionId, updateData);
// };

// // Validate Apple in-app purchase receipt (controller expects: receipt, userId, planId)
// export const verifyAppStorePurchase = async (
//   receipt: string,
//   userId: string,
//   planId: string
// ) => {
//   try {
//     const APPLE_URL = 'https://buy.itunes.apple.com/verifyReceipt';
//     const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';
//     const sharedSecret = process.env.APPLE_SHARED_SECRET;
//     const payload = { 'receipt-data': receipt, password: sharedSecret };
//     let response = await axios.post(APPLE_URL, payload);
//     if (response.data.status === 21007) {
//       response = await axios.post(APPLE_SANDBOX_URL, payload);
//     }
//     if (response.data.status !== 0) {
//       return { success: false, error: 'Invalid Apple receipt' };
//     }
//     // You may want to parse response.data.latest_receipt_info for more details
//     // For now, just mark subscription as active
//     const plan = await SubscriptionPlan.findById(planId);
//     if (!plan) return { success: false, error: 'Plan not found' };
//     const subscription = await InAppSubscription.create({
//       user: userId,
//       plan: planId,
//       isActive: true,
//       status: SubscriptionStatus.ACTIVE,
//       platform: SubscriptionPlatform.IOS,
//       purchaseDate: new Date(),
//     });
//     return { success: true, subscription };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Apple validation failed',
//     };
//   }
// };

// // Validate Google Play in-app purchase token (controller expects: purchaseToken, userId, planId)
// export const verifyGooglePlayPurchase = async (
//   purchaseToken: string,
//   userId: string,
//   planId: string
// ) => {
//   try {
//     // You should use googleapis npm package and a service account for real validation
//     // This is a stub for demonstration
//     // TODO: Implement real Google Play validation
//     const plan = await SubscriptionPlan.findById(planId);
//     if (!plan) return { success: false, error: 'Plan not found' };
//     const subscription = await InAppSubscription.create({
//       user: userId,
//       plan: planId,
//       isActive: true,
//       status: SubscriptionStatus.ACTIVE,
//       platform: SubscriptionPlatform.ANDROID,
//       purchaseToken,
//       purchaseDate: new Date(),
//     });
//     return { success: true, subscription };
//   } catch (error) {
//     return {
//       success: false,
//       error:
//         error instanceof Error ? error.message : 'Google validation failed',
//     };
//   }
// };
