import { Types } from 'mongoose';

export type IExpense = {
  userId: Types.ObjectId;
  amount: number;
  source: string;
  date?: Date;
  category?: string;
  month: string;
  createdAt: Date;
};
