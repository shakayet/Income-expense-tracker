import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { extractDataFromRawText } from './expense.ocr.service';
import * as expenseService from './expense.service';

export const uploadTextAndExtractExpense = catchAsync(
  async (req: Request, res: Response) => {
    const { rawText } = req.body;

    if (!rawText) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Raw text is required',
      });
    }

    const { amount, category } = extractDataFromRawText(rawText);

    if (!amount || !category) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Failed to extract amount or category from raw text',
      });
    }

    const expensePayload = {
      amount,
      category,
      note: 'Created from OCR text',
    };

    const userId = req.user?.id;
    const result = await expenseService.createExpense(userId, expensePayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Expense created from raw OCR text',
      data: result,
    });
  }
);
