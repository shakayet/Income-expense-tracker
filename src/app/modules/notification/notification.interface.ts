import { Types } from 'mongoose';

export type INotification = {
  userId: Types.ObjectId;
  type:
    | 'monthly-report'
    | 'yearly-report'
    | 'budget-warning'
    | 'budget-exceeded'
    | 'category-budget-exceeded';
  title: string;
  message: string;
  reportMonth?: string;
  reportYear?: string;
  budgetAmount: number;
  usedAmount: number;
  isRead?: boolean;
  detailsLink?: string;
  categoryId?: string;
  createdAt?: Date;
};
