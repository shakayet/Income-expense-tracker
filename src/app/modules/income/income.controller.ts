/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Income } from './income.model';

export const createIncome = async (req: Request, res: Response) => {
  try {
    const { source, amount, month } = req.body;
    const userId = (req.user as { id?: string } | undefined)?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const now = new Date();

    const income = await Income.create({
      source,
      amount,
      date: now,
      month,
      userId,
    });

    res.status(201).json({ success: true, data: income });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to create income', error });
  }
};

export const updateIncome = async (req: Request, res: Response) => {
  try {
    const incomeId = req.params.id;
    const userId = (req.user as { id?: string } | undefined)?.id;

    const updated = await Income.findOneAndUpdate(
      { _id: incomeId, userId },
      { ...req.body },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: 'Income not found or unauthorized' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to update income', error });
  }
};

export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const incomeId = req.params.id;
    const userId = (req.user as { id?: string } | undefined)?.id;

    const deleted = await Income.findOneAndDelete({ _id: incomeId, userId });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: 'Income not found or unauthorized' });
    }

    res
      .status(200)
      .json({ success: true, message: 'Income deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete income', error });
  }
};

export const getAllIncomes = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    const { month, page = 1, limit = 10 } = req.query;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Build filter object
    const filter: any = { userId };
    
    // Add month filter if provided
    if (month) {
      filter.month = month;
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get incomes with pagination
    const incomes = await Income.find(filter)
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination info
    const total = await Income.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: incomes,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch incomes', error });
  }
};
