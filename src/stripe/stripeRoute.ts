/* eslint-disable no-console */
import express, { Request, Response } from 'express';
import stripe from '../config/stripe';
import { createStripeProductCatalog } from './createStripeProductCatalog';
import { deleteStripeProductCatalog } from './deleteStripeProductCatalog';
import auth from '../app/middlewares/auth';
import { USER_ROLES } from '../enums/user';

const router = express.Router();

// Route to edit a Stripe plan/product
router.patch(
  '/edit-plan/:productId',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const { name, description, price, currency, interval, interval_count } =
        req.body;
      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required.' });
      }
      // Update product details
      const updatedProduct = await stripe.products.update(productId, {
        ...(name && { name }),
        ...(description && { description }),
      });

      // Optionally update price (Stripe recommends creating a new price and deactivating the old one
      let newPrice = null;
      if (price && currency && interval) {
        // Deactivate old prices
        const prices = await stripe.prices.list({
          product: productId,
          active: true,
        });
        await Promise.all(
          prices.data.map(p => stripe.prices.update(p.id, { active: false }))
        );
        // Create new price
        newPrice = await stripe.prices.create({
          product: productId,
          unit_amount: Number(price) * 100,
          currency,
          recurring: { interval, interval_count: interval_count || 1 },
        });
      }

      return res.status(200).json({
        message: 'Stripe plan/product updated successfully.',
        product: updatedProduct,
        price: newPrice,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Stripe plan update error:', error);
      return res.status(500).json({ message: 'Something went wrong', error });
    }
  }
);

// Route to get all Stripe subscription plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    // Fetch all products (plans) from Stripe
    const products = await stripe.products.list({ active: true });
    // Fetch all prices for these products
    const prices = await stripe.prices.list({ active: true });

    // Map products to include their prices
    const plans = products.data.map(product => {
      const productPrices = prices.data.filter(
        price => price.product === product.id
      );
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        prices: productPrices.map(price => ({
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring,
        })),
      };
    });

    return res.status(200).json({ plans });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching Stripe plans:', error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
});

// Route to delete a Stripe plan/product
router.delete(
  '/delete-plan/:productId',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required.' });
      }
      const result = await deleteStripeProductCatalog(productId);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: 'Failed to delete Stripe plan/product.' });
      }
      return res
        .status(200)
        .json({ message: 'Stripe plan/product deleted successfully.' });
    } catch (error) {
      console.error('Stripe plan deletion error:', error);
      return res.status(500).json({ message: 'Something went wrong', error });
    }
  }
);

router.route('/').post(async (req: Request, res: Response) => {
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

// Route to create a Stripe plan/product
router.post(
  '/create-plan',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  async (req: Request, res: Response) => {
    try {
      const planPayload = req.body;
      const result = await createStripeProductCatalog(planPayload);
      if (!result) {
        return res
          .status(400)
          .json({ message: 'Failed to create Stripe plan/product.' });
      }
      return res.status(201).json({
        message: 'Stripe plan/product created successfully.',
        productId: result.productId,
        paymentLink: result.paymentLink,
      });
    } catch (error) {
      console.error('Stripe plan creation error:', error);
      return res.status(500).json({ message: 'Something went wrong', error });
    }
  }
);

export const stripePayments = router;
