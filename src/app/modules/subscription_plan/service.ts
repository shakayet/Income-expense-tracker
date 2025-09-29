/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISubscriptionPlanInput } from './interface';
import { SubscriptionPlan } from './model';

export class SubscriptionPlanService {
  // Create new subscription plan
  async createSubscriptionPlan(planData: ISubscriptionPlanInput): Promise<any> {
    try {
      const plan = new SubscriptionPlan(planData);
      return await plan.save();
    } catch (error) {
      throw new Error(`Error creating subscription plan`);
    }
  }

  // Get all subscription plans
  async getAllSubscriptionPlans(): Promise<any[]> {
    try {
      return await SubscriptionPlan.find().sort({ created_at: -1 });
    } catch (error) {
      throw new Error(`Error fetching subscription plans`);
    }
  }

  // Get subscription plan by ID
  async getSubscriptionPlanById(id: string): Promise<any> {
    try {
      const plan = await SubscriptionPlan.findById(id);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }
      return plan;
    } catch (error) {
      throw new Error(`Error fetching subscription plan`);
    }
  }

  // Get subscription plan by plan_id
  async getSubscriptionPlanByPlanId(planId: string): Promise<any> {
    try {
      const plan = await SubscriptionPlan.findOne({ plan_id: planId });
      if (!plan) {
        throw new Error('Subscription plan not found');
      }
      return plan;
    } catch (error) {
      throw new Error(`Error fetching subscription plan`);
    }
  }

  // Update subscription plan
  async updateSubscriptionPlan(id: string, planData: Partial<ISubscriptionPlanInput>): Promise<any> {
    try {
      const plan = await SubscriptionPlan.findByIdAndUpdate(
        id,
        planData,
        { new: true, runValidators: true }
      );
      
      if (!plan) {
        throw new Error('Subscription plan not found');
      }
      return plan;
    } catch (error) {
      throw new Error(`Error updating subscription plan`);
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
      throw new Error(`Error deleting subscription plan`);
    }
  }
}