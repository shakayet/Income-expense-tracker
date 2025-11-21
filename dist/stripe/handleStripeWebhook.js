"use strict";
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // Updated handleStripeWebhook.ts
// import { Request, Response } from 'express';
// import Stripe from 'stripe';
// import colors from 'colors';
// import { StatusCodes } from 'http-status-codes';
// import { logger } from '../shared/logger';
// import config from '../config';
// import stripe from '../config/stripe';
// import { handleSubscriptionCreated } from './handleSubscriptionCreated';
// // import ApiError from '../errors/ApiError';
// const handleStripeWebhook = async (req: Request, res: Response) => {
//   // Extract Stripe signature and webhook secret
//   const signature = req.headers['stripe-signature'] as string;
//   const webhookSecret = config.stripe.webhookSecret as string;
//   let event: Stripe.Event;
//   // Verify the event signature using raw body
//   try {
//     event = stripe.webhooks.constructEvent(
//       (req as any).rawBody, // Use the raw body
//       signature, 
//       webhookSecret
//     );
//     logger.info(colors.green(`Webhook verified: ${event.type}`));
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     logger.error(colors.red(`Webhook signature verification failed: ${errorMessage}`));
//     return res.status(StatusCodes.BAD_REQUEST).send(`Webhook Error: ${errorMessage}`);
//   }
//   // Extract event data and type
//   const data = event.data.object as Stripe.Subscription;
//   const eventType = event.type;
//   // Handle the event based on its type
//   try {
//     switch (eventType) {
//       case 'customer.subscription.created':
//         await handleSubscriptionCreated(data);
//         break;
//       default:
//         logger.warn(colors.yellow(`Unhandled event type: ${eventType}`));
//     }
//     res.sendStatus(StatusCodes.OK);
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     logger.error(colors.red(`Error handling event ${eventType}: ${errorMessage}`));
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: `Error handling event: ${errorMessage}`
//     });
//   }
// };
// export default handleStripeWebhook;
