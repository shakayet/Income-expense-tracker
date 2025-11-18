import { Types } from 'mongoose';

export type IExpense = {
  userId: Types.ObjectId;
  amount: number;
  source: string;
  // optional category reference to Category._id
  category?: Types.ObjectId | null;
  date?: Date;
  month: string;
  createdAt: Date;
};
