import { Request, Response } from 'express';
import { InAppPurchaseService } from './inapp.service';

const createPurchase = async (req: Request, res: Response) => {
  // normalize user id from auth middleware; support either `id` or `_id`
  const user = (req as unknown as { user?: { id?: string; _id?: string } })
    .user;
  const userId = user?.id ?? user?._id;
  const payload = {
    ...req.body,
    user: userId,
  };

  const result = await InAppPurchaseService.createPurchaseInDB(payload);
  res.status(201).json({
    success: true,
    message: 'In-app purchase recorded successfully',
    data: result,
  });
};

const getAllPurchases = async (req: Request, res: Response) => {
  const user = (req as unknown as { user?: { id?: string; _id?: string } })
    .user;
  const userId = user?.id ?? user?._id as string;
  const result = await InAppPurchaseService.getAllPurchasesFromDB(userId);
  res.status(200).json({
    success: true,
    message: 'User purchases retrieved successfully',
    data: result,
  });
};

const getSinglePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as unknown as { user?: { id?: string; _id?: string } })
    .user;
  const userId = user?.id ?? user?._id as string;
  const result = await InAppPurchaseService.getSinglePurchaseFromDB(id, userId);
  res.status(200).json({
    success: true,
    message: 'Purchase retrieved successfully',
    data: result,
  });
};

const deletePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as unknown as { user?: { id?: string; _id?: string } })
    .user;
  const userId = user?.id ?? user?._id as string;
  const result = await InAppPurchaseService.deletePurchaseFromDB(id, userId);
  res.status(200).json({
    success: true,
    message: 'Purchase deleted successfully',
    data: result,
  });
};

export const InAppPurchaseController = {
  createPurchase,
  getAllPurchases,
  getSinglePurchase,
  deletePurchase,
};
