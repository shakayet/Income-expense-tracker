import { Request, Response } from 'express';
import {
  createPurchaseInDB,
  getAllPurchasesFromDB,
  getSinglePurchaseFromDB,
  deletePurchaseFromDB,
  checkPremiumStatus as checkPremiumStatusService,
  getUserPurchases as getUserPurchasesService,
  getAnyUserPurchaseHistoryForAdmin,
  PremiumStatusResponse,
} from './inapp.service';
import { IInAppPurchase } from './inapp.interface';
import { Types } from 'mongoose';

// Helper to normalize user id from auth middleware; support either `id` or `_id`
function getUserId(req: Request): string | undefined {
  const user = (req as unknown as { user?: { id?: string; _id?: string } })
    .user;
  return user?.id ?? user?._id;
}

export const createPurchase = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId)
    return res
      .status(401)
      .json({ success: false, message: 'User not authenticated' });

  const payload = {
    ...req.body,
    user: new Types.ObjectId(userId as string),
    purchaseDate: new Date(),
  };

  const result = await createPurchaseInDB(payload as IInAppPurchase);
  res.status(201).json({
    success: true,
    message: 'In-app purchase recorded successfully',
    data: result,
  });
};

export const getAllPurchases = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId)
    return res
      .status(401)
      .json({ success: false, message: 'User not authenticated' });

  const result = await getAllPurchasesFromDB(userId as string);
  res.status(200).json({
    success: true,
    message: 'User purchases retrieved successfully',
    data: result,
  });
};

export const getSinglePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getUserId(req);
  if (!userId)
    return res
      .status(401)
      .json({ success: false, message: 'User not authenticated' });

  const result = await getSinglePurchaseFromDB(id, userId as string);
  res.status(200).json({
    success: true,
    message: 'Purchase retrieved successfully',
    data: result,
  });
};

export const deletePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getUserId(req);
  if (!userId)
    return res
      .status(401)
      .json({ success: false, message: 'User not authenticated' });

  const result = await deletePurchaseFromDB(id, userId as string);
  res.status(200).json({
    success: true,
    message: 'Purchase deleted successfully',
    data: result,
  });
};

export async function checkPremiumStatus(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: 'User not authenticated' });

    const premiumStatus: PremiumStatusResponse =
      await checkPremiumStatusService(userId as string);
    res.status(200).json({ success: true, data: premiumStatus });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking premium status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getUserPurchaseHistory(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: 'User not authenticated' });

    const purchases = await getUserPurchasesService(userId as string);
    res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Admin/Super Admin endpoint to view purchase history for a specific user.
 * Route: GET /admin/users/:userId/purchase-history
 * Auth: ADMIN, SUPER_ADMIN
 */
export async function getAdminUserPurchaseHistory(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: 'userId is required' });

    const purchases = await getAnyUserPurchaseHistoryForAdmin(userId);

    res.status(200).json({
      success: true,
      message: `Purchase history for user ${userId}`,
      data: purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user purchase history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export const InAppPurchaseController = {
  createPurchase,
  getAllPurchases,
  getSinglePurchase,
  deletePurchase,
  checkPremiumStatus,
  getUserPurchaseHistory,
  getAdminUserPurchaseHistory,
};
