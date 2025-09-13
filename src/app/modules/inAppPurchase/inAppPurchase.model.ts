// // inAppPurchase.model.ts
// import { Schema, model } from 'mongoose';
// import {
//   ISubscriptionPlan,
//   IInAppSubscription,
//   SubscriptionPlatform,
//   SubscriptionStatus
// } from './inAppPurchase.interface';

// const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
//   {
//     name: { type: String, required: true, trim: true },
//     description: { type: String, trim: true },
//     planId: { type: String, required: true, unique: true },
//     durationDays: { type: Number, required: true, min: 1 },
//     price: { type: Number, required: true, min: 0 },
//     currency: { type: String, default: 'USD', uppercase: true, length: 3 },
//     trialDays: { type: Number, default: 0, min: 0 },
//     isActive: { type: Boolean, default: true },
//     createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
//     updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
//   },
//   { timestamps: true }
// );

// // Index for better query performance
// SubscriptionPlanSchema.index({ isActive: 1, price: 1 });

// export const SubscriptionPlan = model<ISubscriptionPlan>(
//   'SubscriptionPlan',
//   SubscriptionPlanSchema
// );

// const InAppSubscriptionSchema = new Schema<IInAppSubscription>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true
//     },
//     plan: {
//       type: Schema.Types.ObjectId,
//       ref: 'SubscriptionPlan',
//       required: true
//     },
//     isActive: { type: Boolean, default: false },
//     status: {
//       type: String,
//       enum: Object.values(SubscriptionStatus),
//       default: SubscriptionStatus.EXPIRED
//     },
//     startedAt: { type: Date, default: null },
//     expiresAt: { type: Date, default: null },
//     cancelledAt: { type: Date, default: null },
//     stripeCustomerId: { type: String, default: null, index: true },
//     trialStartedAt: { type: Date, default: null },
//     trialEndsAt: { type: Date, default: null },
//     trialUsed: { type: Boolean, default: false },
//     paymentMethodToken: { type: String, default: null },
//     stripeSubscriptionId: { type: String, default: null, index: true },
//     paypalSubscriptionId: { type: String, default: null, index: true },
//     productId: { type: String, default: null },
//     platform: {
//       type: String,
//       enum: Object.values(SubscriptionPlatform),
//       required: true
//     },
//     purchaseToken: { type: String, default: null },
//     transactionId: { type: String, default: null, index: true },
//     originalTransactionId: { type: String, default: null, index: true },
//     purchaseDate: { type: Date, default: null },
//     createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
//     updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
//   },
//   { timestamps: true }
// );

// // Compound indexes for better query performance
// InAppSubscriptionSchema.index({ user: 1, isActive: 1 });
// InAppSubscriptionSchema.index({ expiresAt: 1, status: 1 });
// InAppSubscriptionSchema.index({ platform: 1, transactionId: 1 });

// export const InAppSubscription = model<IInAppSubscription>(
//   'InAppSubscription',
//   InAppSubscriptionSchema
// );