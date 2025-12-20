import mongoose, { Schema } from 'mongoose';

export type IBudgetCategory = {
  categoryId: string;
  amount: number;
};

export type IBudget = {
  userId: mongoose.Types.ObjectId;
  month: string;
  totalBudget?: number;
  totalCategoryAmount?: number;
  categories?: IBudgetCategory[]; // optional, to allow totalBudget-only budgets
  createdAt: Date;
  updatedAt: Date;
};

const budgetCategorySchema = new Schema<IBudgetCategory>(
  {
    categoryId: {
      type: String,
      required: [true, 'Category ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
  },
  { _id: false }
);

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (YYYY-MM)'],
    },
    totalBudget: {
      type: Number,
      min: [0, 'Total budget cannot be negative'],
    },
    categories: {
      type: [budgetCategorySchema],
      default: [],
    },
    totalCategoryAmount: {
      type: Number,
      default: 0,
      min: [0, 'Total category amount cannot be negative'],
    },
  },
  { timestamps: true }
);

// Validation: Ensure at least one budget type exists
budgetSchema.pre('validate', function (next) {
  if (
    this.totalBudget === undefined &&
    (!this.categories || this.categories.length === 0)
  ) {
    return next(
      new Error('Either totalBudget or at least one category must be provided')
    );
  }
  next();
});

// Auto-calculate totalCategoryAmount before saving
budgetSchema.pre('save', function (next) {
  if (this.categories && this.categories.length > 0) {
    this.totalCategoryAmount = this.categories.reduce(
      (total, category) => total + category.amount,
      0
    );
  } else {
    this.totalCategoryAmount = 0;
  }
  next();
});

// Compound index for unique monthly budgets per user
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);
