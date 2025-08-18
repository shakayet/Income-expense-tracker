import { Types } from 'mongoose';

export type IExpense = {
  userId: Types.ObjectId;
  amount: number;
  category: Types.ObjectId | string;
  note?: string;
  createdAt: Date;
}