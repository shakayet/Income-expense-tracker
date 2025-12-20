import { Types } from 'mongoose';

export type IBudgetCategory = {
  categoryId: string;
  amount: number;
};

export type IBudget = {
  userId: Types.ObjectId;
  month: string; // YYYY-MM
  totalBudget?: number; // optional total monthly budget set by user
  categories?: IBudgetCategory[]; // optional categories, as a budget can be set as a total amount only
  totalCategoryAmount?: number; // calculated total of all categories (optional because it's derived)
};
