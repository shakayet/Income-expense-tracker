/* eslint-disable no-console */
import { Request, Response } from 'express';
import * as expenseService from './expense.service';
import { expenseUpdateSchema } from './expense.zod';
import mongoose, { Types, isValidObjectId } from 'mongoose';
import { Category } from '../category/category.model';
import expenseModel, { ExpenseCategory } from './expense.model';

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

    // Auto-detect current month if not provided
    if (!month) {
      const now = new Date();
      const year = now.getFullYear();
      const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
      month = `${year}-${monthNum}`;
    }

    const [year, monthNum] = (month as string).split('-').map(Number);

    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 1);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const summary = await expenseModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $lookup: {
          from: 'categories', // name of your categories collection
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData',
        },
      },
      { $unwind: '$categoryData' },
      {
        $group: {
          _id: '$categoryData._id',
          categoryName: { $first: '$categoryData.name' },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: 1,
          totalAmount: 1,
        },
      },
    ]);

    const totalExpense = summary.reduce((acc: number, item: { totalAmount: number }) => acc + item.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        month,
        totalExpense,
        breakdown: summary.map(item => ({
          // categoryId: item.categoryId,
          categoryName: item.categoryName,
          amount: item.totalAmount,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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

    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const category = await ExpenseCategory.create({ name, icon, userId });
    res.status(201).json({ success: true, data: category });
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
      return res.status(400).json({ success: false, message: 'Invalid category id' });

    const updated = await ExpenseCategory.findOneAndUpdate(
      { _id: categoryId, userId },
      { name, icon },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: 'Category not found or unauthorized' });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update income category', error });
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
    res.status(500).json({ success: false, message: 'Failed to fetch expense categories', error });
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


