// /* eslint-disable @typescript-eslint/no-explicit-any */
// // inAppPurchase.service.ts
// import { Types } from 'mongoose';
// import {
//   ISubscriptionPlan,
//   IInAppSubscription,
//   SubscriptionPlatform,
//   SubscriptionStatus,
//   WebhookResult
// } from './inAppPurchase.interface';
// import { InAppSubscription, SubscriptionPlan } from './inAppPurchase.model';
// import { StripeService } from '../stripe/stripe.service';
// import { AppleIAPService } from '../apple/appleIAP.service';
// import { GoogleIAPService } from '../google/googleIAP.service';

// // SubscriptionPlan CRUD
// export const createSubscriptionPlan = async (payload: Omit<ISubscriptionPlan, 'createdAt' | 'updatedAt'>) => {
//   return SubscriptionPlan.create(payload);
// };

// export const getAllSubscriptionPlans = async (filters: { isActive?: boolean } = {}) => {
//   const query: any = {};
//   if (filters.isActive !== undefined) query.isActive = filters.isActive;
  
//   return SubscriptionPlan.find(query).sort({ price: 1 });
// };

// export const getSubscriptionPlanById = async (id: string) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return SubscriptionPlan.findById(id);
// };

// export const updateSubscriptionPlan = async (id: string, payload: Partial<ISubscriptionPlan>) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return SubscriptionPlan.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
// };

// export const deleteSubscriptionPlan = async (id: string) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return SubscriptionPlan.findByIdAndDelete(id);
// };

// // InAppSubscription CRUD
// export const createInAppSubscription = async (payload: Omit<IInAppSubscription, 'createdAt' | 'updatedAt'>) => {
//   return InAppSubscription.create(payload);
// };

// export const getAllInAppSubscriptions = async (filters: { user?: string; isActive?: boolean } = {}) => {
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

// export const updateInAppSubscription = async (id: string, payload: Partial<IInAppSubscription>) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return InAppSubscription.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
//     .populate('user', 'name email')
//     .populate('plan', 'name price durationDays');
// };

// export const deleteInAppSubscription = async (id: string) => {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return InAppSubscription.findByIdAndDelete(id);
// };

// // Business logic methods
// export const processPaymentWebhook = async (payload: any, signature: string): Promise<WebhookResult> => {
//   try {
//     // Determine the payment provider from the payload or signature
//     let verifiedPayload;
//     let platform: SubscriptionPlatform;
    
//     if (signature.includes('stripe')) {
//       platform = SubscriptionPlatform.STRIPE;
//       verifiedPayload = await StripeService.verifyWebhook(payload, signature);
//     } else if (payload.event_type && payload.event_type.includes('PAYMENT.SALE')) {
//       platform = SubscriptionPlatform.PAYPAL;
//       verifiedPayload = payload; // PayPal verification would happen here
//     } else {
//       return { success: false, error: 'Unsupported payment provider' };
//     }
    
//     // Process based on event type
//     const eventType = verifiedPayload.type || verifiedPayload.event_type;
//     const subscriptionId = verifiedPayload.data?.object?.id || verifiedPayload.resource?.billing_agreement_id;
    
//     if (!subscriptionId) {
//       return { success: false, error: 'No subscription ID found in webhook' };
//     }
    
//     // Find the subscription in our database
//     const subscription = await InAppSubscription.findOne({
//       $or: [
//         { stripeSubscriptionId: subscriptionId },
//         { paypalSubscriptionId: subscriptionId }
//       ]
//     }).populate('plan');
    
//     if (!subscription) {
//       return { success: false, error: 'Subscription not found in database' };
//     }
    
//     // Update subscription based on event type
//     switch (eventType) {
//       case 'invoice.payment_succeeded':
//       case 'PAYMENT.SALE.COMPLETED':
//         await updateSubscriptionStatus(
//           subscription._id.toString(),
//           SubscriptionStatus.ACTIVE,
//           new Date(),
//           new Date(Date.now() + subscription.plan.durationDays * 24 * 60 * 60 * 1000)
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
//     isActive: status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.IN_TRIAL
//   };
  
//   if (startedAt !== undefined) updateData.startedAt = startedAt;
//   if (expiresAt !== undefined) updateData.expiresAt = expiresAt;
//   if (cancelledAt !== undefined) updateData.cancelledAt = cancelledAt;
  
//   return updateInAppSubscription(subscriptionId, updateData);
// };

// export const verifyAppStorePurchase = async (receipt: string, productId: string) => {
//   return AppleIAPService.verifyPurchase(receipt, productId);
// };

// export const verifyGooglePlayPurchase = async (purchaseToken: string, productId: string) => {
//   return GoogleIAPService.verifyPurchase(purchaseToken, productId);
// };