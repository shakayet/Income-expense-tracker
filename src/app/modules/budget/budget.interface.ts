import { Types } from 'mongoose';

export type IBudgetCategory = {
  category: string;
  amount: number;
  percentage?: number; // This will be calculated when retrieving the budget
}

export type IBudget = {
  userId: Types.ObjectId;
  month: string; // YYYY-MM
  categories: IBudgetCategory[];
  totalAmount: number; // Total budget for the month
}