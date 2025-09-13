import { Request, Response } from 'express';
import * as expenseService from './expense.service';
import { expenseUpdateSchema } from './expense.zod';
import { Types, isValidObjectId } from 'mongoose';
import { Category } from '../category/category.model';

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
