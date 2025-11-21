"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBudgetCategoryZodSchema = exports.addBudgetCategoryZodSchema = exports.updateMonthlyBudgetZodSchema = exports.setMonthlyBudgetZodSchema = exports.setBudgetZodSchema = void 0;
const zod_1 = require("zod");
// Budget Category Schema
const budgetCategorySchema = zod_1.z.object({
    categoryId: zod_1.z.string(),
    amount: zod_1.z.number().min(0),
});
// Set/Update Budget with categories
// Only requires categories, as totalBudget is handled by a different endpoint
exports.setBudgetZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        month: zod_1.z
            .string()
            .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (YYYY-MM)'),
        categories: zod_1.z
            .array(budgetCategorySchema)
            .min(1, 'At least one category must be provided'),
    }),
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
