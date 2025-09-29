import { Request, Response } from 'express';
import { SubscriptionPlanService } from './service';

const subscriptionPlanService = new SubscriptionPlanService();

export class SubscriptionPlanController {
  async createSubscriptionPlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await subscriptionPlanService.createSubscriptionPlan(req.body);
      res.status(201).json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'error at createSubscriptionPlan'
      });
    }
  }

  async getAllSubscriptionPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await subscriptionPlanService.getAllSubscriptionPlans();
      res.status(200).json({
        success: true,
        data: plans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'error at getAllSubscriptionPlans'
      });
    }
  }

  async getSubscriptionPlanById(req: Request, res: Response): Promise<void> {
    try {
      const plan = await subscriptionPlanService.getSubscriptionPlanById(req.params.id);
      res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'error at getSubscriptionPlanById'
      });
    }
  }

  async updateSubscriptionPlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await subscriptionPlanService.updateSubscriptionPlan(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "error at updateSubscriptionPlan"
      });
    }
  }

  async deleteSubscriptionPlan(req: Request, res: Response): Promise<void> {
    try {
      await subscriptionPlanService.deleteSubscriptionPlan(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Subscription plan deleted successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'error at deleteSubscriptionPlan'
      });
    }
  }
}