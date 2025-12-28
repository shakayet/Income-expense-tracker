import { z } from 'zod';

// Budget Category Schema
const budgetCategorySchema = z.object({
  categoryId: z.string(),
  amount: z.number().min(0),
});

// Set/Update Budget with categories
// Only requires categories, as totalBudget is handled by a different endpoint
export const setBudgetZodSchema = z.object({
  body: z
    .object({
      month: z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (YYYY-MM)'),
      categories: z.array(budgetCategorySchema).optional(),
      totalBudget: z.number().min(0).optional(),
    })
    .refine(
      data =>
        (Array.isArray(data.categories) && data.categories.length > 0) ||
        data.totalBudget !== undefined,
      {
        message:
          'Either categories (non-empty) or totalBudget must be provided',
      }
    ),
});

// Schema for updating an existing budget by month (body doesn't need month)
export const updateBudgetZodSchema = z.object({
  body: z
    .object({
      categories: z.array(budgetCategorySchema).optional(),
      totalBudget: z.number().min(0).optional(),
      // single-category update identifiers
      categoryId: z.string().optional(),
      category: z.string().optional(),
      _id: z.string().optional(),
      amount: z.number().min(0).optional(),
    })
    .refine(
      data =>
        (Array.isArray(data.categories) && data.categories.length > 0) ||
        data.totalBudget !== undefined ||
        ((data.categoryId || data.category || data._id) &&
          data.amount !== undefined),
      {
        message:
          'Provide categories (non-empty) OR totalBudget OR (category identifier and amount)',
      }
    ),
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
