'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.updateBudgetCategoryZodSchema =
  exports.addBudgetCategoryZodSchema =
  exports.updateMonthlyBudgetZodSchema =
  exports.setMonthlyBudgetZodSchema =
  exports.setBudgetZodSchema =
    void 0;
const zod_1 = require('zod');
// Budget Category Schema
const budgetCategorySchema = zod_1.z.object({
  categoryId: zod_1.z.string(),
  amount: zod_1.z.number().min(0),
});
// Set/Update Budget with categories
// Only requires categories, as totalBudget is handled by a different endpoint
exports.setBudgetZodSchema = zod_1.z.object({
  body: zod_1.z
    .object({
      month: zod_1.z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (YYYY-MM)'),
      categories: zod_1.z.array(budgetCategorySchema).optional(),
      totalBudget: zod_1.z.number().min(0).optional(),
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
exports.updateBudgetZodSchema = zod_1.z.object({
  body: zod_1.z
    .object({
      categories: zod_1.z.array(budgetCategorySchema).optional(),
      totalBudget: zod_1.z.number().min(0).optional(),
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
  categoryId: zod_1.z.string().optional(),
  category: zod_1.z.string().optional(),
  _id: zod_1.z.string().optional(),
  amount: zod_1.z.number().min(0).optional(),
});
// Set Monthly Budget (without categories)
exports.setMonthlyBudgetZodSchema = zod_1.z.object({
  body: zod_1.z.object({
    totalBudget: zod_1.z.number().min(0),
    month: zod_1.z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (YYYY-MM)'),
  }),
});
// Update Monthly Budget
exports.updateMonthlyBudgetZodSchema = zod_1.z.object({
  body: zod_1.z.object({
    totalBudget: zod_1.z.number().min(0),
  }),
});
// Add Budget Category
exports.addBudgetCategoryZodSchema = zod_1.z.object({
  body: zod_1.z.object({
    categoryId: zod_1.z.string(),
    amount: zod_1.z.number().min(0),
  }),
});
// Update Budget Category
exports.updateBudgetCategoryZodSchema = zod_1.z.object({
  body: zod_1.z.object({
    amount: zod_1.z.number().min(0),
  }),
});
