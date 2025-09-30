/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISubscriptionInput } from './inAppPurchase.interface';
import { Subscription } from './inAppPurchase.model';

export class SubscriptionService {
  // Create new subscription
  async createSubscription(subscriptionData: ISubscriptionInput): Promise<any> {
    try {
      const subscription = new Subscription(subscriptionData);
      return await subscription.save();
    } catch (error: any) {
      throw new Error(`Error creating subscription: ${error.message}`);
    }
  }

  // Get subscription by user ID
  async getSubscriptionByUserId(userId: string): Promise<any> {
    try {
      const subscription = await Subscription.findOne({ user: userId })
        .populate('user', 'name email')
        .populate('created_by', 'name')
        .populate('updated_by', 'name');
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      return subscription;
    } catch (error: any) {
      throw new Error(`Error fetching subscription: ${error.message}`);
    }
  }

  // Get all subscriptions
  async getAllSubscriptions(): Promise<any[]> {
    try {
      return await Subscription.find()
        .populate('user', 'name email')
        .populate('created_by', 'name')
        .populate('updated_by', 'name')
        .sort({ created_at: -1 });
    } catch (error: any) {
      throw new Error(`Error fetching subscriptions: ${error.message}`);
    }
  }

  // Update subscription
  async updateSubscription(userId: string, subscriptionData: Partial<ISubscriptionInput>): Promise<any> {
    try {
      const subscription = await Subscription.findOneAndUpdate(
        { user: userId },
        subscriptionData,
        { new: true, runValidators: true }
      ).populate('user', 'name email');
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      return subscription;
    } catch (error: any) {
      throw new Error(`Error updating subscription: ${error.message}`);
    }
  }

  // Activate subscription
  async activateSubscription(userId: string, planId: string, paymentData: any): Promise<any> {
    try {
      const subscription = await Subscription.findOneAndUpdate(
        { user: userId },
        {
          is_active: true,
          started_at: new Date(),
          expires_at: this.calculateExpiryDate(planId),
          ...paymentData
        },
        { new: true, upsert: true }
      );
      
      return subscription;
    } catch (error: any) {
      throw new Error(`Error activating subscription: ${error.message}`);
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<any> {
    try {
      const subscription = await Subscription.findOneAndUpdate(
        { user: userId },
        {
          is_active: false,
          status_is: 'cancelled'
        },
        { new: true }
      );
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      return subscription;
    } catch (error: any) {
      throw new Error(`Error cancelling subscription: ${error.message}`);
    }
  }

  // Check if subscription is active
  async isSubscriptionActive(userId: string): Promise<boolean> {
    try {
      const subscription = await Subscription.findOne({
        user: userId,
        is_active: true,
        expires_at: { $gt: new Date() }
      });
      
      return !!subscription;
    } catch (error: any) {
      throw new Error(`Error checking subscription status: ${error.message}`);
    }
  }

  // ✅ New: Handle in-app purchase success
  // async handleInAppSuccess(appUserId: string, price: number): Promise<any> {
  //   try {
  //     // Business logic (investing money, updating subscription, etc.)
  //     const result = await investMoney(appUserId, price);

  //     // Optionally, update subscription record too
  //     await Subscription.findOneAndUpdate(
  //       { user: appUserId },
  //       {
  //         is_active: true,
  //         started_at: new Date(),
  //         expires_at: this.calculateExpiryDate('default_plan'),
  //         last_payment_amount: price
  //       },
  //       { new: true, upsert: true }
  //     );

  //     return result;
  //   } catch (error: any) {
  //     throw new Error(`Error handling in-app success: ${error.message}`);
  //   }
  // }

  // Helper method to calculate expiry date
  private calculateExpiryDate(planId: string): Date {
    // This would typically fetch plan duration from database
    // For now, using a default of 30 days
    console.log(`Calculating expiry date for planId: ${planId}`);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    return expiryDate;
  }
}