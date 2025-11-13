import { ISubscriptionPlanInput, ISubscriptionPlan } from './interface';
import { SubscriptionPlan } from './model';
import { Document } from 'mongoose';

type PlanDoc = Document & ISubscriptionPlan;

export class SubscriptionPlanService {
  // Create new subscription plan
  async createSubscriptionPlan(
    planData: ISubscriptionPlanInput
  ): Promise<PlanDoc> {
    try {
      const plan = new SubscriptionPlan(planData);
      return await plan.save();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      // Handle duplicate key errors with a clearer message
      if (/E11000|duplicate key/i.test(msg)) {
        throw new Error('Subscription plan with this plan_id already exists');
      }
      throw new Error(`Error creating subscription plan: ${msg}`);
    }
  }

  // Get all subscription plans
  async getAllSubscriptionPlans(): Promise<PlanDoc[]> {
    try {
      return await SubscriptionPlan.find().sort({ created_at: -1 });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Error fetching subscription plans: ${msg}`);
    }
  }

  // Get subscription plan by ID
  async getSubscriptionPlanById(id: string): Promise<PlanDoc> {
    try {
      const plan = await SubscriptionPlan.findById(id);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }
      return plan;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Error fetching subscription plan: ${msg}`);
    }
  }

  // Get subscription plan by plan_id
  async getSubscriptionPlanByPlanId(planId: string): Promise<PlanDoc> {
    try {
      const plan = await SubscriptionPlan.findOne({ plan_id: planId });
      if (!plan) {
        throw new Error('Subscription plan not found');
      }
      return plan;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Error fetching subscription plan: ${msg}`);
    }
  }

  // Update subscription plan
  async updateSubscriptionPlan(
    id: string,
    planData: Partial<ISubscriptionPlanInput>
  ): Promise<PlanDoc | null> {
    try {
      const plan = await SubscriptionPlan.findByIdAndUpdate(id, planData, {
        new: true,
        runValidators: true,
      });

      if (!plan) {
        throw new Error('Subscription plan not found');
      }
      return plan;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Error updating subscription plan: ${msg}`);
    }
  }

  // Delete subscription plan
  async deleteSubscriptionPlan(id: string): Promise<void> {
    try {
      const plan = await SubscriptionPlan.findByIdAndDelete(id);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Error deleting subscription plan: ${msg}`);
    }
  }
}
