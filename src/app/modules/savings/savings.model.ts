import { Schema, model } from 'mongoose';
import { ISavings, SavingsModel } from './savings.interface';

const savingsSchema = new Schema<ISavings, SavingsModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    initialPrice: { type: Number, required: true },
    actualPrice: { type: Number, required: true },
    savings: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Savings = model<ISavings, SavingsModel>('Savings', savingsSchema);
