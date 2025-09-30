import { Schema, model } from 'mongoose';
import { ISubscriptionPlan } from './interface';

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    plan_id: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
    },
    duration_days: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Indexes for better performance
subscriptionPlanSchema.index({ plan_id: 1 });
subscriptionPlanSchema.index({ created_at: -1 });

export const SubscriptionPlan = model<ISubscriptionPlan>(
  'SubscriptionPlan',
  subscriptionPlanSchema
);
