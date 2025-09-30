import { ObjectId } from 'mongoose';

export type ISubscription = {
  user: ObjectId;
  is_active: boolean;
  started_at?: Date;
  expires_at?: Date;
  stripe_customer_id?: string;
  status_is?: string;
  
  // Trial information
  trial_started_at?: Date;
  trial_used: boolean;

  // Payment & Subscription Information
  payment_method_token?: string;
  stripe_subscription_id?: string;
  product_id?: string;
  platform?: string;  // web, iOS, Android
  purchase_token?: string;
  transaction_id?: string;
  original_transaction_id?: string;
  purchase_date?: Date;

  // Created/Updated info
  created_by?: ObjectId;
  updated_by?: ObjectId;
  created_at: Date;
  updated_at: Date;
}

export type ISubscriptionInput = {
  user: ObjectId;
  is_active?: boolean;
  started_at?: Date;
  expires_at?: Date;
  stripe_customer_id?: string;
  status_is?: string;
  trial_started_at?: Date;
  trial_used?: boolean;
  payment_method_token?: string;
  stripe_subscription_id?: string;
  product_id?: string;
  platform?: string;
  purchase_token?: string;
  transaction_id?: string;
  original_transaction_id?: string;
  purchase_date?: Date;
  created_by?: ObjectId;
  updated_by?: ObjectId;
}