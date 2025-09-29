import { ObjectId } from 'mongoose';

export type ISubscriptionPlan = {
  name: string;
  plan_id: string;  // PayPal/Stripe plan id
  duration_days: number;
  price: number;
  created_at: Date;
  updated_at: Date;
  created_by?: ObjectId;
  updated_by?: ObjectId;
}

export type ISubscriptionPlanInput = {
  name: string;
  plan_id: string;
  duration_days: number;
  price: number;
  created_by?: ObjectId;
  updated_by?: ObjectId;
}