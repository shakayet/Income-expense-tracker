import { Types } from "mongoose";

export type INotification = {
  userId: Types.ObjectId;
  type: 'monthly-report' | 'yearly-report' | 'budget-warning' | 'budget-exceeded';
  title: string;
  message: string;
  reportMonth?: string;
  reportYear?: string;
  budgetAmount: number;
  usedAmount: number;
  isRead?: boolean;
  createdAt?: Date;
}
