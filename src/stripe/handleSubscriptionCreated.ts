import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import { User } from '../app/modules/user/user.model';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { Plan } from '../app/modules/plan/plan.model';
import ApiError from '../errors/ApiError';

// Helper function to create new subscription in database
import { Types } from 'mongoose';
type SubscriptionPayload = {
  customerId: string;
  price: number;
  user: Types.ObjectId;
  userEmail: string;
  plan: Types.ObjectId;
  planTitle: string;
  trxId: string;
  subscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

const createNewSubscription = async (payload: SubscriptionPayload) => {
  const isExistSubscription = await Subscription.findOne({
    user: payload.user,
  });
  if (isExistSubscription) {
    await Subscription.findByIdAndUpdate(
      { _id: isExistSubscription._id },
      payload,
      { new: true }
    );
  } else {
    const newSubscription = new Subscription(payload);
    await newSubscription.save();
  }
};

export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
  try {
    // Retrieve subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(data.id as string);
    const customer = (await stripe.customers.retrieve(
      subscription.customer as string
    )) as Stripe.Customer;
    const productId = subscription.items.data[0]?.price?.product as string;
    const invoice = (await stripe.invoices.retrieve(
      subscription.latest_invoice as string
    )) as Stripe.Invoice;

    // Stripe.Invoice does not have payment_intent, use invoice.id as transaction id
    const trxId = invoice.id || '';
    const amountPaid = (invoice?.total || 0) / 100;

    // Find user and pricing plan
    const user = await User.findOne({ email: customer.email });
    if (!user || !user._id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid User!');
    }

    const plan = await Plan.findOne({ productId });
    if (!plan || !plan._id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid Plan!');
    }

    // Get the current period start and end dates (Unix timestamps)
    // Stripe.Subscription does not have current_period_start/end, use start_date and end_date if available
    const currentPeriodStart = subscription.start_date
      ? new Date(subscription.start_date * 1000).toISOString()
      : '';
    const currentPeriodEnd = subscription.ended_at
      ? new Date(subscription.ended_at * 1000).toISOString()
      : '';

    const payload = {
      customerId: customer.id,
      price: amountPaid,
      user: user._id,
      userEmail: user.email,
      plan: plan._id,
      planTitle: plan.title,
      trxId,
      subscriptionId: subscription.id,
      status: 'active',
      currentPeriodStart,
      currentPeriodEnd,
    };
    // Create new subscription and update user status
    await createNewSubscription(payload);

    await User.findByIdAndUpdate(
      { _id: user._id },
      { subscribe: true },
      { new: true }
    );
  } catch (error) {
    return error;
  }
};
