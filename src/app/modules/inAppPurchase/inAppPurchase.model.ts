import { Schema, model } from 'mongoose';
import { ISubscription } from './inAppPurchase.interface';
// import { ISubscription } from '../interfaces/ISubscription';

const subscriptionSchema = new Schema<ISubscription>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  is_active: {
    type: Boolean,
    default: false
  },
  started_at: {
    type: Date,
    default: null
  },
  expires_at: {
    type: Date,
    default: null
  },
  stripe_customer_id: {
    type: String,
    maxlength: 255,
    default: null
  },
  status_is: {
    type: String,
    maxlength: 255,
    default: null
  },
  trial_started_at: {
    type: Date,
    default: null
  },
  trial_used: {
    type: Boolean,
    default: false
  },
  payment_method_token: {
    type: String,
    maxlength: 255,
    default: null
  },
  stripe_subscription_id: {
    type: String,
    maxlength: 255,
    default: null
  },
  product_id: {
    type: String,
    maxlength: 255,
    default: null
  },
  platform: {
    type: String,
    maxlength: 255,
    default: null
  },
  purchase_token: {
    type: String,
    maxlength: 255,
    default: null
  },
  transaction_id: {
    type: String,
    maxlength: 255,
    default: null
  },
  original_transaction_id: {
    type: String,
    maxlength: 255,
    default: null
  },
  purchase_date: {
    type: Date,
    default: null
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updated_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes for better performance
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ is_active: 1 });
subscriptionSchema.index({ expires_at: 1 });
subscriptionSchema.index({ stripe_customer_id: 1 });
subscriptionSchema.index({ stripe_subscription_id: 1 });

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema);