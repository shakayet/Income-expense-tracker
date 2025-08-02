import mongoose, { Schema, Document, Types } from 'mongoose';
import { IExpense } from './expense.interface';

const ExpenseSchema: Schema = new Schema<IExpense>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema);