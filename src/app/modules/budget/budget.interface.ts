import { Schema, Types, model } from 'mongoose';

export interface IBudget {
  userId: Types.ObjectId;
  month: string; // YYYY-MM
  amount: number; // budget amount for the month
}
