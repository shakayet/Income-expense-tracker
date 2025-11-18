import { Types } from 'mongoose';

export type IExpense = {
  userId: Types.ObjectId;
  amount: number;
  source: string;
  date?: Date;
  month: string;
  createdAt: Date;
};
