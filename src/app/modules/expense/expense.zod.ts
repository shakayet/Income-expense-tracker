
// zod for input validation schemas for expense module

import z from "zod";

export const createExpenseZodSchema = z.object({
  body: z.object({
    amount: z.number(),
    source: z.string(),
    note: z.string().optional(),
  }),
});

export const expenseUpdateSchema = z.object({
  amount: z.number().optional(),
  source: z.string().optional(),
  month: z.string().optional(),
  date: z.string().datetime().optional()
});
