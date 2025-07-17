import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  userId: Types.ObjectId;
  amount: number;
  category: string;
  note?: string;
  createdAt: Date;
}