import { Request, Response } from 'express';
import { InAppPurchaseService } from './inapp.service';

const createPurchase = async (req: Request, res: Response) => {
  const result = await InAppPurchaseService.createPurchaseInDB(req.body);
  res.status(201).json({
    success: true,
    message: 'In-app purchase recorded successfully',
    data: result,
  });
};

const getAllPurchases = async (_req: Request, res: Response) => {
  const result = await InAppPurchaseService.getAllPurchasesFromDB();
  res.status(200).json({
    success: true,
    message: 'All purchases retrieved successfully',
    data: result,
  });
};

const getSinglePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await InAppPurchaseService.getSinglePurchaseFromDB(id);
  res.status(200).json({
    success: true,
    message: 'Purchase retrieved successfully',
    data: result,
  });
};

const deletePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await InAppPurchaseService.deletePurchaseFromDB(id);
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
