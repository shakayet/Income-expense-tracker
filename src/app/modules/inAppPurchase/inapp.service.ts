/* eslint-disable no-undef */
/* eslint-disable no-console */
import { InAppPurchase } from './inapp.model';
import { IInAppPurchase } from './inapp.interface';
import { Types } from 'mongoose';
import { User } from '../user/user.model';

export const createPurchaseInDB = async (
  payload: IInAppPurchase,
  userId: string
) => {
  try {
    // Check if a purchase with the same transactionId already exists
    const existingPurchase = await InAppPurchase.findOne({
      transactionId: payload.transactionId,
    });

    if (existingPurchase) {
      // If the purchase already exists, return it instead of creating a new one
      console.log(`Duplicate transaction detected: ${payload.transactionId}`);
      return `Duplicate transaction detected: ${payload.transactionId}`;
    }

    // Create a new purchase record
    const result = await InAppPurchase.create(payload);

    // Update the user's currentSubscription and userType
    await User.findByIdAndUpdate(
      userId,
      { currentSubscription: result._id, userType: 'pro' },
      { new: true }
    );

    // Return the newly created purchase record
    return result;
  } catch (error) {
    console.error('Error in creating purchase:', error);
    throw new Error('Failed to create purchase'); // You can throw or handle this error further
  }
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
    // First, check if user is manually set as pro by admin
    const user = await User.findById(userId).select('userType').lean();
    
    // If admin has manually set user as pro, return premium with 30 days
    if (user?.userType === 'pro') {
      // Check if user has any valid purchase
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

      // If no purchase found (admin-managed pro user), return 30 days
      if (!latestPurchase) {
        return { isPremium: true, daysLeft: 30 };
      }
      
      // If purchase exists, check if it's valid
      const isValid = isSubscriptionValid(latestPurchase as IInAppPurchase);
      
      // If valid purchase exists, use its daysLeft
      if (isValid) {
        const daysLeft = calculateDaysLeft(latestPurchase as IInAppPurchase);
        // Update currentSubscription but keep userType as pro
        await User.findByIdAndUpdate(
          userId,
          { currentSubscription: latestPurchase._id },
          { new: true }
        );
        return { isPremium: true, daysLeft };
      }
      
      // If purchase exists but is invalid, still return premium (admin-managed)
      return { isPremium: true, daysLeft: 30 };
    }

    // Original logic for non-pro users (userType is not 'pro')
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

// Add this interface if not already defined
type PremiumStatusResponse = {
  isPremium: boolean;
  daysLeft?: number;
}