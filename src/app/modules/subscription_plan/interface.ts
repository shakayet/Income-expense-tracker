import { ObjectId } from 'mongoose';

export type ISubscriptionPlan = {
  name: string;
  plan_id: string;  // PayPal/Stripe plan id
  duration_days: number;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export type ISubscriptionPlanInput = {
  name: string;
  plan_id: string;
  duration_days: number;
  price: number;
  updated_by?: ObjectId;
}