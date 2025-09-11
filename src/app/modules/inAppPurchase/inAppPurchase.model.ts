import { Schema, model } from 'mongoose';
import {
  ISubscriptionPlan,
  IInAppSubscription,
} from './inAppPurchase.interface';

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    planId: { type: String, required: true, unique: true },
    durationDays: { type: Number, required: true },
    price: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const SubscriptionPlan = model<ISubscriptionPlan>(
  'SubscriptionPlan',
  SubscriptionPlanSchema
);

const InAppSubscriptionSchema = new Schema<IInAppSubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    isActive: { type: Boolean, default: false },
    startedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    stripeCustomerId: { type: String, default: null },
    statusIs: { type: String, default: null },
    trialStartedAt: { type: Date, default: null },
    trialUsed: { type: Boolean, default: false },
    paymentMethodToken: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    productId: { type: String, default: null },
    platform: { type: String, default: null },
    purchaseToken: { type: String, default: null },
    transactionId: { type: String, default: null },
    originalTransactionId: { type: String, default: null },
    purchaseDate: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const InAppSubscription = model<IInAppSubscription>(
  'InAppSubscription',
  InAppSubscriptionSchema
);
