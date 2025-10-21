
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
  amount: z.preprocess(
    val => (val === undefined ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  category: z.string().min(1).optional(),
  note: z.string().optional(),
});
