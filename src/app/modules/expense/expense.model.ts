import mongoose, { Schema, model } from 'mongoose';
import { IExpense } from './expense.interface';

const ExpenseSchema: Schema = new Schema<IExpense>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  month: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const expenseCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: null },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const ExpenseCategory = model('ExpenseCategory', expenseCategorySchema);
export default mongoose.model<IExpense>('Expense', ExpenseSchema);