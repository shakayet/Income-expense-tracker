import { Model, Types } from 'mongoose';

export type ISubscription = {
  _id?: string;
  customerId: string;
  price: number;
  user: Types.ObjectId;
  userEmail: string;
  plan: Types.ObjectId;
  planTitle: string;
  trxId: string;
  subscriptionId: string;
  status: 'expired' | 'active' | 'cancel';
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;
