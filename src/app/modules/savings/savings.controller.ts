import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SavingsService } from './savings.service';
// import { JwtPayload } from 'jsonwebtoken';

const createSavings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id; // optional from auth middleware
  const result = await SavingsService.createSavings({ ...req.body, userId });
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Savings record created successfully',
    data: result,
  });
});

const getAllSavings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id as string;
  const result = await SavingsService.getAllSavings(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Savings fetched successfully',
    data: result,
  });
});

const getSavingsSummaryByCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id as string;
  const result = await SavingsService.getSavingsSummaryByCategory(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Category-wise savings summary fetched successfully',
    data: result,
  });
});

export const SavingsController = {
  createSavings,
  getAllSavings,
  getSavingsSummaryByCategory,
};
