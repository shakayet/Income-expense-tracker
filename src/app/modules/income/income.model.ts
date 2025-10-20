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
    // enum: ['salary', 'business', 'gift', 'rent', 'freelancing', 'others'],
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

const incomeCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: null },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const IncomeCategory = model('IncomeCategory', incomeCategorySchema);
export const Income = model<IIncome>('Income', incomeSchema);