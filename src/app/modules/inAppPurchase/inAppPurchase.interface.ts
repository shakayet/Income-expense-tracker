import { Types } from 'mongoose';

export type ISubscriptionPlan = {
  name: string;
  planId: string; // PayPal/Stripe plan id
  durationDays: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
};

export type IInAppSubscription = {
  user: Types.ObjectId;
  isActive: boolean;
  startedAt?: Date | null;
  expiresAt?: Date | null;
  stripeCustomerId?: string | null;
  statusIs?: string | null;
  trialStartedAt?: Date | null;
  trialUsed?: boolean;
  paymentMethodToken?: string | null;
  stripeSubscriptionId?: string | null;
  productId?: string | null;
  platform?: string | null;
  purchaseToken?: string | null;
  transactionId?: string | null;
  originalTransactionId?: string | null;
  purchaseDate?: Date | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
};
