// // inAppPurchase.interface.ts
// import { Types } from 'mongoose';

// export enum SubscriptionPlatform {
//   IOS = 'ios',
//   ANDROID = 'android',
//   STRIPE = 'stripe',
//   PAYPAL = 'paypal'
// }

// export enum SubscriptionStatus {
//   ACTIVE = 'active',
//   EXPIRED = 'expired',
//   CANCELLED = 'cancelled',
//   IN_TRIAL = 'in_trial',
//   PAST_DUE = 'past_due'
// }

// export type ISubscriptionPlan = {
//   name: string;
//   description?: string;
//   planId: string; // PayPal/Stripe plan id
//   durationDays: number;
//   price: number;
//   currency?: string;
//   trialDays?: number;
//   isActive?: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
//   createdBy?: Types.ObjectId | null;
//   updatedBy?: Types.ObjectId | null;
// };

// export type IInAppSubscription = {
//   user: Types.ObjectId;
//   plan: Types.ObjectId;
//   isActive: boolean;
//   status: SubscriptionStatus;
//   startedAt?: Date | null;
//   expiresAt?: Date | null;
//   cancelledAt?: Date | null;
//   stripeCustomerId?: string | null;
//   trialStartedAt?: Date | null;
//   trialEndsAt?: Date | null;
//   trialUsed?: boolean;
//   paymentMethodToken?: string | null;
//   stripeSubscriptionId?: string | null;
//   paypalSubscriptionId?: string | null;
//   productId?: string | null;
//   platform: SubscriptionPlatform;
//   purchaseToken?: string | null;
//   transactionId?: string | null;
//   originalTransactionId?: string | null;
//   purchaseDate?: Date | null;
//   createdBy?: Types.ObjectId | null;
//   updatedBy?: Types.ObjectId | null;
//   createdAt?: Date;
//   updatedAt?: Date;
// };

// export type WebhookResult = {
//   success: boolean;
//   error?: string;
//   subscription?: IInAppSubscription;
// };