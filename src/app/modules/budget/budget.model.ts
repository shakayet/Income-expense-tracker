import { model, Schema } from 'mongoose';
import { IBudget, IBudgetCategory } from './budget.interface';

const budgetCategorySchema = new Schema<IBudgetCategory>({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  percentage: { type: Number, default: 0 }
});

const budgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    categories: [budgetCategorySchema],
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate total amount
budgetSchema.pre('save', function(next) {
  this.totalAmount = this.categories.reduce((sum, cat) => sum + cat.amount, 0);
  
  // Calculate percentage for each category
  this.categories.forEach(cat => {
    cat.percentage = this.totalAmount > 0 ? (cat.amount / this.totalAmount) * 100 : 0;
  });
  
  next();
});

export const Budget = model<IBudget>('Budget', budgetSchema);