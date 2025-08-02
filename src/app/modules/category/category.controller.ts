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

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updated = await CategoryService.updateCategory(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated successfully',
    data: updated,
  });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const deleted = await CategoryService.deleteCategory(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully',
    data: deleted,
  });
});
