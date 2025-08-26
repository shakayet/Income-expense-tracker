import { model, Schema } from 'mongoose';
import { IBudget, IBudgetCategory } from './budget.interface';

const budgetCategorySchema = new Schema<IBudgetCategory>(
  {
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const budgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    totalBudget: { type: Number },
    categories: {
      type: [budgetCategorySchema],
    },
    totalCategoryAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Pre-validation hook to ensure at least one budget type is present
budgetSchema.pre('validate', function (next) {
  if (this.totalBudget === undefined && (!this.categories || this.categories.length === 0)) {
    return next(new Error('Either a totalBudget or at least one category must be provided'));
  }
  next();
});

// Pre-save hook to calculate totalCategoryAmount based on categories
budgetSchema.pre('save', function (next) {
  // Only calculate if categories exist
  if (this.categories && this.categories.length > 0) {
    this.totalCategoryAmount = this.categories.reduce(
      (sum, cat) => sum + cat.amount,
      0
    );
  }
  next();
});

budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

export const Budget = model<IBudget>('Budget', budgetSchema);