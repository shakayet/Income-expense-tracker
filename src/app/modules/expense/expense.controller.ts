import { Request, Response } from 'express';
import * as expenseService from './expense.service';
import {  expenseUpdateSchema } from './expense.zod';
import { Types } from 'mongoose';

export const createExpense = async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user.id);
  const data = req.body;
  // const validated = expenseCreateSchema.safeParse(req.body);

  // if (!validated.success) return res.status(400).json(validated.error);

  const expense = await expenseService.createExpense(userId, data);
  res.json(expense);
};

export const getExpenses = async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user.id);
  const expenses = await expenseService.getExpensesByUser(userId);
  res.json(expenses);
};

export const updateExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = new Types.ObjectId(req.user.id);
  const validated = expenseUpdateSchema.safeParse(req.body);

  if (!validated.success) return res.status(400).json(validated.error);

  const expense = await expenseService.updateExpense(id, userId, validated.data);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
};

export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = new Types.ObjectId(req.user.id);
  const result = await expenseService.deleteExpense(id, userId);

  if (!result) return res.status(404).json({ message: 'Expense not found' });
  res.json(result);
};