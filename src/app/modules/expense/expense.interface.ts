import { Types } from 'mongoose';

export type IExpense = {
  userId: Types.ObjectId;
  amount: number;
  category: string;
  note?: string;
  createdAt: Date;
}