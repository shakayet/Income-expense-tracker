import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import * as categoryService from './category.service';

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const category = await categoryService.createCategory({ ...req.body, user: userId });
  
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const categories = await categoryService.getUserCategories(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User categories fetched successfully',
    data: categories,
  });
});
