/* eslint-disable @typescript-eslint/no-explicit-any */
import { InAppSubscription, SubscriptionPlan } from './inAppPurchase.model';

// SubscriptionPlan CRUD
export const createSubscriptionPlan = async (payload: any) => {
  return SubscriptionPlan.create(payload);
};

export const getAllSubscriptionPlans = async () => {
  return SubscriptionPlan.find();
};

export const getSubscriptionPlanById = async (id: string) => {
  return SubscriptionPlan.findById(id);
};

export const updateSubscriptionPlan = async (id: string, payload: any) => {
  return SubscriptionPlan.findByIdAndUpdate(id, payload, { new: true });
};

export const deleteSubscriptionPlan = async (id: string) => {
  return SubscriptionPlan.findByIdAndDelete(id);
};

// InAppSubscription CRUD
export const createInAppSubscription = async (payload: any) => {
  return InAppSubscription.create(payload);
};

export const getAllInAppSubscriptions = async () => {
  return InAppSubscription.find();
};

export const getInAppSubscriptionById = async (id: string) => {
  return InAppSubscription.findById(id);
};

export const updateInAppSubscription = async (id: string, payload: any) => {
  return InAppSubscription.findByIdAndUpdate(id, payload, { new: true });
};

export const deleteInAppSubscription = async (id: string) => {
  return InAppSubscription.findByIdAndDelete(id);
};
