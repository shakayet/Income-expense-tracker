import { StatusCodes } from 'http-status-codes';
import stripe from '../config/stripe';
import config from '../config';
import ApiError from '../errors/ApiError';

type UpdateStripeProductPayload = {
  price: number;
  duration: '1 month' | '3 months' | '6 months' | '1 year';
};

export const updateStripeProductCatalog = async (
  productId: string,
  payload: UpdateStripeProductPayload
): Promise<string> => {
  let interval: 'month' | 'year' = 'month';
  let intervalCount = 1;

  // map duration to interval_count
  switch (payload.duration) {
    case '1 month':
      interval = 'month';
      intervalCount = 1;
      break;
    case '1 year':
      interval = 'year';
      intervalCount = 1;
      break;
    default:
      interval = 'month';
      intervalCount = 1;
  }

  // Create a new price for the existing product
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: Math.round(payload.price * 100),
    currency: 'usd',
    recurring: { interval, interval_count: intervalCount },
  });

  // if failed to create new price
  if (!price) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create new price in Stripe'
    );
  }

  // retrieved current prices;
  const oldPrices = await stripe.prices.list({
    product: productId,
    active: true,
  });

  // deactivate current prices
  for (const oldPrice of oldPrices.data) {
    await stripe.prices.update(oldPrice.id, { active: false });
  }

  // Create a new payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${config.stripe.paymentSuccess}`,
      },
    },
    metadata: {
      productId: productId,
    },
  });

  // if failed to create payment link
  if (!paymentLink.url) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create new payment link'
    );
  }

  return paymentLink.url;
};
