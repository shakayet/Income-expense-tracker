/* eslint-disable no-console */
import { notifyOnBudgetThreshold } from '../budget/budget.service';
import { IExpense } from './expense.interface';
import Expense from './expense.model';
import { Types } from 'mongoose';

export const createExpense = async (
  userId: string,
  data: Partial<IExpense>
): Promise<IExpense> => {
  const dateObj =
    data && typeof data.createdAt === 'string'
      ? new Date(data.createdAt)
      : new Date();

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');

  const expense = await Expense.create({
    ...data,
    userId: new Types.ObjectId(userId), // ✅ ensure ObjectId for DB
    date: data.date || dateObj,
    month: data.month || `${year}-${month}`,
  });

  await notifyOnBudgetThreshold(userId, `${year}-${month}`); // ✅ notify expects string

  return expense;
};

export const getExpensesByUser = (userId: Types.ObjectId) => {
  return Expense.find({ userId }).sort({ date: -1 });
};

export const updateExpense = (
  id: string,
  userId: Types.ObjectId,
  data: Partial<IExpense>
) => {
  return Expense.findOneAndUpdate({ _id: id, userId }, data, { new: true });
};

export const deleteExpense = (id: string, userId: Types.ObjectId) => {
  return Expense.findOneAndDelete({ _id: id, userId });
};

export const getExpenseById = (id: string, userId: Types.ObjectId) => {
  return Expense.findOne({ _id: id, userId });
};
