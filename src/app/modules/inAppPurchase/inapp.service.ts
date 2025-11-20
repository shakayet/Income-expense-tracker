import { InAppPurchase } from './inapp.model';
import { IInAppPurchase } from './inapp.interface';
import { Types } from 'mongoose';
import { User } from '../user/user.model';

export type PremiumStatusResponse = {
  isPremium: boolean;
  daysLeft?: number;
};

export const createPurchaseInDB = async (
  payload: IInAppPurchase,
  userId: string
) => {
  const result = await InAppPurchase.create(payload);
  await User.findByIdAndUpdate(
    userId,
    { currentSubscription: result._id, userType: 'pro' },
    { new: true }
  );

  return result;
};

export const getAllPurchasesFromDB = async (userId: string) => {
  const result = await InAppPurchase.find({ user: userId }).populate('user');
  return result;
};

export const getSinglePurchaseFromDB = async (id: string, userId: string) => {
  const result = await InAppPurchase.findOne({
    _id: id,
    user: userId,
  }).populate('user');
  return result;
};

export const deletePurchaseFromDB = async (id: string, userId: string) => {
  const result = await InAppPurchase.findOneAndDelete({
    _id: id,
    user: userId,
  });
  return result;
};

export async function checkPremiumStatus(
  userId: string
): Promise<PremiumStatusResponse> {
  try {
    const latestPurchase = await InAppPurchase.findOne({
      user: new Types.ObjectId(userId),
      productId: {
        $in: [
          'com.mashiur.expenseapp.yearly',
          'com.mashiur.expenseapp.monthly',
        ],
      },
    })
      .sort({ purchaseDate: -1 })
      .lean();

    if (!latestPurchase) {
      // Update user to free if no premium purchase found
      await User.findByIdAndUpdate(
        userId,
        {
          userType: 'free',
          currentSubscription: null,
        },
        { new: true }
      );
      return { isPremium: false };
    }

    const isValid = isSubscriptionValid(latestPurchase as IInAppPurchase);

    if (!isValid) {
      // Update user to free if subscription is no longer valid
      await User.findByIdAndUpdate(
        userId,
        {
          userType: 'free',
          currentSubscription: null,
        },
        { new: true }
      );
      return { isPremium: false };
    }

    const daysLeft = calculateDaysLeft(latestPurchase as IInAppPurchase);

    // Ensure user is set to premium if subscription is valid
    await User.findByIdAndUpdate(
      userId,
      {
        userType: 'pro',
        currentSubscription: latestPurchase._id,
      },
      { new: true }
    );

    return { isPremium: true, daysLeft };
  } catch (error) {
    throw new Error(`Error checking premium status: ${error}`);
  }
}

export function isSubscriptionValid(purchase: IInAppPurchase): boolean {
  const now = new Date();
  const purchaseDate = new Date(purchase.purchaseDate);
  let subscriptionDays = 0;
  if (purchase.productId === 'com.mashiur.expenseapp.yearly')
    subscriptionDays = 365;
  else if (purchase.productId === 'com.mashiur.expenseapp.monthly')
    subscriptionDays = 30;
  const expirationDate = new Date(purchaseDate);
  expirationDate.setDate(purchaseDate.getDate() + subscriptionDays);
  return now <= expirationDate;
}

export function calculateDaysLeft(purchase: IInAppPurchase): number {
  const now = new Date();
  const purchaseDate = new Date(purchase.purchaseDate);
  let subscriptionDays = 0;
  if (purchase.productId === 'com.mashiur.expenseapp.yearly')
    subscriptionDays = 365;
  else if (purchase.productId === 'com.mashiur.expenseapp.monthly')
    subscriptionDays = 30;
  const expirationDate = new Date(purchaseDate);
  expirationDate.setDate(purchaseDate.getDate() + subscriptionDays);
  const timeDiff = expirationDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(0, daysLeft);
}

export async function getUserPurchases(
  userId: string
): Promise<IInAppPurchase[]> {
  return await InAppPurchase.find({ user: new Types.ObjectId(userId) })
    .sort({ purchaseDate: -1 })
    .lean();
}

/**
 * Admin endpoint: get purchase history for any user by their userId.
 * Used by admins to view a specific user's purchase history.
 */
export async function getAnyUserPurchaseHistoryForAdmin(
  targetUserId: string
): Promise<IInAppPurchase[]> {
  return await InAppPurchase.find({
    user: new Types.ObjectId(targetUserId),
  })
    .populate('user', 'id email')
    .sort({ purchaseDate: -1 })
    .lean();
}
