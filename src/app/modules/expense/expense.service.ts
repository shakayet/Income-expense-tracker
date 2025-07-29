import { checkAndNotifyBudgetUsage } from '../budget/budget.controller';
import { createNotification } from '../notification/notification.service';
import { IExpense } from './expense.interface';
import Expense from './expense.model';
import { Types } from 'mongoose';

export const createExpense = async (
  userId: string,
  data: Partial<IExpense>
) => {
  // Determine the date for the expense (use data.date or current date)
  const dateObj = (data as any)?.date
    ? new Date((data as any).date)
    : new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');


  await checkAndNotifyBudgetUsage(userId.toString(), `${year}-${month}`);
  console.log(Expense);
  return Expense.create({ ...data, userId });
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
