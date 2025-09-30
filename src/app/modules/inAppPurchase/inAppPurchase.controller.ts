/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { SubscriptionService } from './inAppPurchase.service';
import sendResponse from '../../../shared/sendResponse';

const subscriptionService = new SubscriptionService();

export class SubscriptionController {
  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const subscription = await subscriptionService.createSubscription(
        req.body
      );
      res.status(201).json({
        success: true,
        data: subscription,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getSubscriptionByUser(req: Request, res: Response): Promise<void> {
    try {
      const subscription = await subscriptionService.getSubscriptionByUserId(
        req.params.userId
      );
      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const subscriptions = await subscriptionService.getAllSubscriptions();
      res.status(200).json({
        success: true,
        data: subscriptions,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const subscription = await subscriptionService.updateSubscription(
        req.params.userId,
        req.body
      );
      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async activateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { planId, paymentData } = req.body;
      const subscription = await subscriptionService.activateSubscription(
        req.params.userId,
        planId,
        paymentData
      );
      res.status(200).json({
        success: true,
        data: subscription,
        message: 'Subscription activated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const subscription = await subscriptionService.cancelSubscription(
        req.params.userId
      );
      res.status(200).json({
        success: true,
        data: subscription,
        message: 'Subscription cancelled successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async checkSubscriptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const isActive = await subscriptionService.isSubscriptionActive(
        req.params.userId
      );
      res.status(200).json({
        success: true,
        data: { is_active: isActive },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // async onInappSucccess(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { event } = req.body;
  //     const result = await investMoney(event.app_user_id, event.price);

  //     sendResponse(res, {
  //       statusCode: httpStatus.OK,
  //       success: true,
  //       message: 'Payment Submitted successfully!',
  //       data: result,
  //     });
  //   } catch (error: any) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }
}
