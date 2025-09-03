import { z } from 'zod';

// Budget Category Schema
const budgetCategorySchema = z.object({
  categoryId: z.string(),
  amount: z.number().min(0),
});

// Set/Update Budget with categories
// Only requires categories, as totalBudget is handled by a different endpoint
export const setBudgetZodSchema = z.object({
  body: z.object({
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (YYYY-MM)'),
    categories: z
      .array(budgetCategorySchema)
      .min(1, 'At least one category must be provided'),
  }),
});

// Set Monthly Budget (without categories)
export const setMonthlyBudgetZodSchema = z.object({
  body: z.object({
    totalBudget: z.number().min(0),
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (YYYY-MM)'),
  }),
});

// Update Monthly Budget
export const updateMonthlyBudgetZodSchema = z.object({
  body: z.object({
    totalBudget: z.number().min(0),
  }),
});

// Add Budget Category
export const addBudgetCategoryZodSchema = z.object({
  body: z.object({
    categoryId: z.string(),
    amount: z.number().min(0),
  }),
});

// Update Budget Category
export const updateBudgetCategoryZodSchema = z.object({
  body: z.object({
    amount: z.number().min(0),
  }),
});
