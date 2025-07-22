import { Types } from "mongoose";

export interface INotification {
  userId: Types.ObjectId;
  type: 'monthly-report' | 'yearly-report' | 'budget-warning' | 'budget-exceeded';
  title: string;
  message: string;
  reportMonth?: string;
  reportYear?: string;
  isRead?: boolean;
  createdAt?: Date;
}
