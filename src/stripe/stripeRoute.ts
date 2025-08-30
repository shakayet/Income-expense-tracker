/* eslint-disable no-console */

import express, { Request, Response } from 'express';
import stripe from '../config/stripe';

const router = express.Router();

router
  .route('/')
  .post(async (req: Request, res: Response) => {
    const { id } = req.body;

    console.log('Checkout session request received with plan ID:', id);

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: id, // this should be the Stripe Price ID, not the plan id
            quantity: 1,
          },
        ],
        success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:5173/cancelled`,
      });

      return res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Checkout session error:', error);
      return res.status(500).json({ message: 'Something went wrong', error });
    }
  });

export const stripePayments = router;
