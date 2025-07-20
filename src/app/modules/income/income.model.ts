import { Schema, model } from "mongoose";
import { IIncome } from "./income.interface";

const incomeSchema = new Schema<IIncome>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  source: {
    type: String,
    enum: ['salary', 'business', 'gift', 'rent', 'others'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  month: {
    type: String,
    required: true,
  }
});

export const Income = model<IIncome>('Income', incomeSchema);