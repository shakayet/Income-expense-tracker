import { Types } from 'mongoose';

export type IIncome = {
  userId: Types.ObjectId;
  source: string;
  amount: number;
  date: Date;
  month: string;
}