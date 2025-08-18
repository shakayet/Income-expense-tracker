import { Types } from 'mongoose';

export type IBudget = {
  userId: Types.ObjectId;
  month: string; // YYYY-MM
  amount: number; // budget amount for the month
}
