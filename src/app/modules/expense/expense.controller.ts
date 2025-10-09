/* eslint-disable no-console */
import { Request, Response } from 'express';
import * as expenseService from './expense.service';
import { expenseUpdateSchema } from './expense.zod';
import mongoose, { Types, isValidObjectId } from 'mongoose';
import { Category } from '../category/category.model';
import expenseModel from './expense.model';

export const createExpense = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const data = req.body;

    // Validate category ObjectId
    if (!data.category || !isValidObjectId(data.category)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const catObj = new Types.ObjectId(data.category);

    // Check if category exists and is accessible by the user
    const category = await Category.findOne({ _id: catObj });

    if (
      !category ||
      (category.userId && category.userId.toString() !== userId.toString())
    ) {
      return res
        .status(400)
        .json({ message: 'Category not found or not accessible' });
    }

    // Create expense, ensure category is ObjectId
    const expense = await expenseService.createExpense(userId, {
      ...data,
      category: catObj,
    });
    return res.status(201).json(expense);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = new Types.ObjectId(req.user.id);
  const expenses = await expenseService.getExpensesByUser(userId);
  res.status(200).json({
    success: true,
    data: expenses,
  });
};

export const updateExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = new Types.ObjectId(req.user.id);
  const validated = expenseUpdateSchema.safeParse(req.body);

  if (!validated.success) {
    return res.status(400).json(validated.error);
  }

  // Optional: Validate category if it's being updated
  const updateData = validated.data;
  if (updateData.category) {
    if (!isValidObjectId(updateData.category)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await Category.findById(updateData.category);
    if (
      !category ||
      (category.userId && category.userId.toString() !== userId.toString())
    ) {
      return res
        .status(400)
        .json({ message: 'Category not found or not accessible' });
    }
  }

  const expense = await expenseService.updateExpense(id, userId, updateData);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
};

export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = new Types.ObjectId(req.user.id);
  const result = await expenseService.deleteExpense(id, userId);

  if (!result) return res.status(404).json({ message: 'Expense not found' });
  res.json(result);
};

export const getExpense = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid expense ID' });
  }

  const userId = new Types.ObjectId(req.user.id);
  const expense = await expenseService.getExpenseById(id, userId);

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  res.json(expense);
};

export const getMonthlyExpenseSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    let { month } = req.query;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Determine month range
    let startDate: Date;
    let endDate: Date;

    if (month) {
      // Month provided → format: YYYY-MM
      const [year, monthStr] = (month as string).split('-');
      const monthNum = parseInt(monthStr) - 1; // JS month is 0-indexed
      startDate = new Date(Number(year), monthNum, 1);
      endDate = new Date(Number(year), monthNum + 1, 0, 23, 59, 59, 999);
    } else {
      // Default: current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    const summary = await expenseModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category', // category is ObjectId here
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalExpense = summary.reduce(
      (acc: number, item: { totalAmount: number }) => acc + item.totalAmount,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        month,
        totalExpense,
        breakdown: summary.map((item: { _id: string; totalAmount: number }) => ({
          category: item._id,
          amount: item.totalAmount,
        })),
      },
    });
  } catch (error) {
    console.error('Expense summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly expense summary',
      error,
    });
  }
};
