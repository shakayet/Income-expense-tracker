import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  userId: Types.ObjectId;
  amount: number;
  category: Types.ObjectId | string;
  note?: string;
  createdAt: Date;
}