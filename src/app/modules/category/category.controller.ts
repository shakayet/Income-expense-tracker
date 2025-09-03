import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { CategoryService } from './category.service';
import { createCategory as createCategoryService } from './category.service';

export const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Unauthorized: User not found',
      });
    }

    const result = await createCategoryService(req.body, userId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Category created successfully!',
      data: result,
    });
  }
);

export const getAllCategories = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Unauthorized: User not found',
      });
    }
    const result = await CategoryService.getAllCategories(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Categories retrieved successfully',
      data: result,
    });
  }
);

export const updateCategory = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Unauthorized: User not found',
      });
    }
    const category = await CategoryService.updateCategory(
      req.params.id,
      userId,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  }
);

export const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, {
        success: false,
        statusCode: 401,
        message: 'Unauthorized: User not found',
      });
    }
    const result = await CategoryService.deleteCategory(req.params.id, userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Category deleted successfully',
      data: result,
    });
  }
);
