/* eslint-disable no-console */
import { Request, Response } from 'express';
import * as expenseService from './expense.service';
import { expenseUpdateSchema } from './expense.zod';
import mongoose, { Types, isValidObjectId, PipelineStage } from 'mongoose';
import type { IExpense } from './expense.interface';
import { Category } from '../category/category.model';
import expenseModel, { ExpenseCategory } from './expense.model';

export const createExpense = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.user.id; // keep string here for function params
    const { source, amount, month } = req.body;
    const now = new Date();

    const expense = await expenseService.createExpense(userId, {
      userId: new Types.ObjectId(userId), // ✅ Mongoose expects ObjectId
      source,
      amount: Number(amount),
      date: now,
      month:
        month ||
        `${now.getFullYear()}-${(now.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`,
    });

    return res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
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

  // Convert category id string to ObjectId for the service layer
  const updatePayload: Partial<IExpense> = {
    ...updateData,
    category: updateData.category
      ? updateData.category
      : undefined,
  };

  const expense = await expenseService.updateExpense(id, userId, updatePayload);
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
    // Prefer month from params (as requested), fallback to query
    const monthParam = (req.params as Record<string, string> | undefined)
      ?.month;
    let month = monthParam ?? (req.query.month as string | undefined);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Auto-detect current month if not provided
    if (!month) {
      const now = new Date();
      const year = now.getFullYear();
      const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
      month = `${year}-${monthNum}`;
    }

    // Validate month format YYYY-MM
    if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid month format. Use YYYY-MM' });
    }

    const [year, monthNum] = (month as string).split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 1);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Simplified pipeline - group by source field directly
    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: userObjectId,
          $or: [
            { month: month },
            { date: { $gte: startDate, $lt: endDate } },
            { createdAt: { $gte: startDate, $lt: endDate } },
          ],
        },
      },
      {
        $group: {
          _id: '$source', // Group by the source field which contains category
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          categoryName: '$_id',
          totalAmount: 1
        }
      },
      { $sort: { totalAmount: -1 } }
    ];

    const summary = await expenseModel.aggregate(pipeline);

    const totalExpense = summary.reduce(
      (acc: number, item: { totalAmount: number }) =>
        acc + (item.totalAmount || 0),
      0
    );

    // Calculate percentage for each category
    const breakdownWithPercentage = summary.map(item => ({
      source: item.categoryName,
      amount: item.totalAmount,
      percentage: totalExpense > 0 
        ? Math.round((item.totalAmount / totalExpense) * 100 * 100) / 100 // Rounds to 2 decimal places
        : 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        month,
        totalExpense,
        breakdown: breakdownWithPercentage,
      },
    });
  } catch (error) {
    console.error('getMonthlyExpenseSummary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly expense summary',
      error,
    });
  }
};

export const createExpenseCategory = async (req: Request, res: Response) => {
  try {
    const { name, icon } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    // 🔍 Check if category already exists for this user
    const existingCategory = await ExpenseCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // case-insensitive match
      userId,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'This expense category already exists.',
      });
    }

    const category = await ExpenseCategory.create({ name, icon, userId });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create income category', error });
  }
};

export const updateExpenseCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const { name, icon } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(categoryId))
      return res
        .status(400)
        .json({ success: false, message: 'Invalid category id' });

    const updated = await ExpenseCategory.findOneAndUpdate(
      { _id: categoryId, userId },
      { name, icon },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized',
      });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update income category',
      error,
    });
  }
};

export const getExpenseCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const categories = await ExpenseCategory.find({
      $or: [{ userId: null }, { userId }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense categories',
      error,
    });
  }
};

export const deleteIncomeCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(categoryId))
      return res
        .status(400)
        .json({ success: false, message: 'Invalid category id' });

    const deleted = await ExpenseCategory.findOneAndDelete({
      _id: categoryId,
      userId,
    });

    if (!deleted)
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized',
      });

    res
      .status(200)
      .json({ success: true, message: 'Income category deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete income category', error });
  }
};
