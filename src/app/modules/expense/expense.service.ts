import { IExpense } from './expense.interface';
import Expense from './expense.model';
import { Types } from 'mongoose';

export const createExpense = (userId: Types.ObjectId, data: Partial<IExpense>) => {
  return Expense.create({ ...data, userId });
};

export const getExpensesByUser = (userId: Types.ObjectId) => {
  return Expense.find({ userId }).sort({ date: -1 });
};

export const updateExpense = (id: string, userId: Types.ObjectId, data: Partial<IExpense>) => {
  return Expense.findOneAndUpdate({ _id: id, userId }, data, { new: true });
};

export const deleteExpense = (id: string, userId: Types.ObjectId) => {
  return Expense.findOneAndDelete({ _id: id, userId });
};