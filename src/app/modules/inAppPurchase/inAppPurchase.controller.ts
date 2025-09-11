import { Request, Response } from 'express';
import * as InAppPurchaseService from './inAppPurchase.service';

// SubscriptionPlan CRUD
export const createSubscriptionPlan = async (req: Request, res: Response) => {
  const plan = await InAppPurchaseService.createSubscriptionPlan(req.body);
  res.status(201).json({ success: true, data: plan });
};

export const getAllSubscriptionPlans = async (_req: Request, res: Response) => {
  const plans = await InAppPurchaseService.getAllSubscriptionPlans();
  res.json({ success: true, data: plans });
};

export const getSubscriptionPlanById = async (req: Request, res: Response) => {
  const plan = await InAppPurchaseService.getSubscriptionPlanById(
    req.params.id
  );
  if (!plan)
    return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: plan });
};

export const updateSubscriptionPlan = async (req: Request, res: Response) => {
  const plan = await InAppPurchaseService.updateSubscriptionPlan(
    req.params.id,
    req.body
  );
  if (!plan)
    return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: plan });
};

export const deleteSubscriptionPlan = async (req: Request, res: Response) => {
  const plan = await InAppPurchaseService.deleteSubscriptionPlan(req.params.id);
  if (!plan)
    return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, message: 'Deleted' });
};

// InAppSubscription CRUD
export const createInAppSubscription = async (req: Request, res: Response) => {
  const sub = await InAppPurchaseService.createInAppSubscription(req.body);
  res.status(201).json({ success: true, data: sub });
};

export const getAllInAppSubscriptions = async (
  _req: Request,
  res: Response
) => {
  const subs = await InAppPurchaseService.getAllInAppSubscriptions();
  res.json({ success: true, data: subs });
};

export const getInAppSubscriptionById = async (req: Request, res: Response) => {
  const sub = await InAppPurchaseService.getInAppSubscriptionById(
    req.params.id
  );
  if (!sub)
    return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: sub });
};

export const updateInAppSubscription = async (req: Request, res: Response) => {
  const sub = await InAppPurchaseService.updateInAppSubscription(
    req.params.id,
    req.body
  );
  if (!sub)
    return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: sub });
};

export const deleteInAppSubscription = async (req: Request, res: Response) => {
  const sub = await InAppPurchaseService.deleteInAppSubscription(req.params.id);
  if (!sub)
    return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, message: 'Deleted' });
};
