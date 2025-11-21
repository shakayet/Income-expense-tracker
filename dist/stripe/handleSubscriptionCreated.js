"use strict";
// // Enhanced handleSubscriptionCreated.ts
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable no-console */
// import { StatusCodes } from 'http-status-codes';
// import Stripe from 'stripe';
// import stripe from '../config/stripe';
// import { User } from '../app/modules/user/user.model';
// import { Subscription } from '../app/modules/subscription/subscription.model';
// import { Plan } from '../app/modules/plan/plan.model';
// import ApiError from '../errors/ApiError';
// import { logger } from '../../src/shared/logger';
// import colors from 'colors';
// // Helper function to create new subscription in database
// import { Types } from 'mongoose';
// type SubscriptionPayload = {
//   customerId: string;
//   price: number;
//   user: Types.ObjectId;
//   userEmail: string;
//   plan: Types.ObjectId;
//   planTitle: string;
//   trxId: string;
//   subscriptionId: string;
//   status: string;
//   currentPeriodStart: string;
//   currentPeriodEnd: string;
// };
// const createNewSubscription = async (payload: SubscriptionPayload) => {
//   try {
//     logger.info(colors.blue('Creating/updating subscription in database...'));
//     logger.info(colors.blue(`Payload: ${JSON.stringify(payload, null, 2)}`));
//     const isExistSubscription = await Subscription.findOne({
//       user: payload.user,
//     });
//     if (isExistSubscription) {
//       logger.info(colors.blue('Updating existing subscription'));
//       const updated = await Subscription.findByIdAndUpdate(
//         { _id: isExistSubscription._id },
//         payload,
//         { new: true, runValidators: true }
//       );
//       logger.info(colors.green(`Subscription updated: ${updated?._id}`));
//       return updated;
//     } else {
//       logger.info(colors.blue('Creating new subscription'));
//       const newSubscription = new Subscription(payload);
//       const saved = await newSubscription.save();
//       logger.info(colors.green(`New subscription created: ${saved._id}`));
//       return saved;
//     }
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     logger.error(colors.red(`Error in createNewSubscription: ${errorMessage}`));
//     throw new ApiError(
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       `Failed to create/update subscription: ${errorMessage}`
//     );
//   }
// };
// export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
//   try {
//     logger.info(colors.blue('Processing subscription created event...'));
//     logger.info(colors.blue(`Event data: ${JSON.stringify(data, null, 2)}`));
//     // Retrieve full subscription from Stripe
//     const subscriptionResponse = await stripe.subscriptions.retrieve(data.id);
//     // If your Stripe library returns a Response<Subscription>, access .data
//     const subscription = (subscriptionResponse as any).data ?? subscriptionResponse;
//     logger.info(colors.blue(`Retrieved subscription: ${subscription.id}`));
//     const customer = await stripe.customers.retrieve(
//       subscription.customer as string
//     ) as Stripe.Customer;
//     logger.info(colors.blue(`Retrieved customer: ${customer.id}`));
//     const productId = subscription.items.data[0]?.price?.product as string;
//     logger.info(colors.blue(`Product ID: ${productId}`));
//     const invoiceResponse = await stripe.invoices.retrieve(
//       subscription.latest_invoice as string
//     );
//     const invoice = (invoiceResponse as any).data ?? invoiceResponse;
//     logger.info(colors.blue(`Retrieved invoice: ${invoice.id}`));
//     // Transaction ID: prefer payment_intent if available, else use invoice.id
//     const trxId = invoice.payment_intent || invoice.id || '';
//     const amountPaid = (invoice.total || 0) / 100;
//     logger.info(colors.blue(`Transaction ID: ${trxId}, Amount: ${amountPaid}`));
//     // Find user and plan
//     const user = await User.findOne({ email: customer.email });
//     if (!user || !user._id) {
//       logger.error(colors.red(`User not found with email: ${customer.email}`));
//       throw new ApiError(StatusCodes.NOT_FOUND, `Invalid User! Email: ${customer.email}`);
//     }
//     logger.info(colors.blue(`Found user: ${user._id}`));
//     const plan = await Plan.findOne({ productId });
//     if (!plan || !plan._id) {
//       logger.error(colors.red(`Plan not found with productId: ${productId}`));
//       throw new ApiError(StatusCodes.NOT_FOUND, `Invalid Plan! Product ID: ${productId}`);
//     }
//     logger.info(colors.blue(`Found plan: ${plan._id}`));
//     // Use correct subscription period fields
//     const currentPeriodStart = subscription.current_period_start
//       ? new Date(subscription.current_period_start * 1000).toISOString()
//       : new Date().toISOString();
//     const currentPeriodEnd = subscription.current_period_end
//       ? new Date(subscription.current_period_end * 1000).toISOString()
//       : new Date().toISOString();
//     // Ensure status is one of the allowed values for schema
//     let status: 'active' | 'expired' | 'cancel' = 'active';
//     if (subscription.status === 'canceled') status = 'cancel';
//     else if (
//       subscription.status === 'incomplete_expired' ||
//       subscription.status === 'unpaid' ||
//       subscription.status === 'past_due'
//     ) {
//       status = 'expired';
//     }
//     const payload = {
//       customerId: customer.id,
//       price: amountPaid,
//       user: user._id,
//       userEmail: user.email,
//       plan: plan._id,
//       planTitle: plan.title,
//       trxId,
//       subscriptionId: subscription.id,
//       status,
//       currentPeriodStart,
//       currentPeriodEnd,
//     };
//     logger.info(colors.blue(`Subscription payload: ${JSON.stringify(payload, null, 2)}`));
//     // Save subscription to DB
//     await createNewSubscription(payload);
//     logger.info(colors.green('Subscription saved to database'));
//     // Update user subscription status
//     await User.findByIdAndUpdate(
//       { _id: user._id },
//       { subscribe: true },
//       { new: true }
//     );
//     logger.info(colors.green('User subscription status updated'));
//   } catch (error) {
//     logger.error(colors.red(`Error in handleSubscriptionCreated: ${error instanceof Error ? error.message : String(error)}`));
//     if (error instanceof Error) {
//       logger.error(colors.red(`Stack trace: ${error.stack}`));
//     }
//     throw error;
//   }
// };
