import { Schema, model, Document } from 'mongoose';
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
    // legacy/camelCase field - some older data/indexes use `planId`
    planId: {
      type: String,
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
// `plan_id` is already declared `unique: true` in the schema definition which
// creates a unique index; avoid creating a duplicate index here.
// subscriptionPlanSchema.index({ plan_id: 1 }); // duplicate - removed
subscriptionPlanSchema.index({ created_at: -1 });

// Keep planId in sync with plan_id to satisfy legacy indexes and migrations
type PlanDoc = Document & {
  plan_id?: string;
  planId?: string;
};

subscriptionPlanSchema.pre('validate', function (this: PlanDoc, next) {
  // If one of the fields exists but the other doesn't, copy the value so unique indexes won't see null
  if (!this.planId && this.plan_id) {
    this.planId = this.plan_id;
  }
  if (!this.plan_id && this.planId) {
    this.plan_id = this.planId;
  }
  next();
});

export const SubscriptionPlan = model<ISubscriptionPlan>(
  'SubscriptionPlan',
  subscriptionPlanSchema
);
