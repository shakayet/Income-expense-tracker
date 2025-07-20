import { model, Schema } from "mongoose";
import { IBudget } from "./budget.interface";

const budgetSchema = new Schema<IBudget>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

export const Budget = model<IBudget>('Budget', budgetSchema);