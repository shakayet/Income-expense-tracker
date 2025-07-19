import { z } from 'zod';

// zod for input validation schemas for expense module

export const expenseCreateSchema = z.object({
  amount: z.preprocess(val => Number(val), z.number().positive()),
  category: z.string().min(1),
  note: z.string().optional(),
});

export const expenseUpdateSchema = z.object({
  amount: z.preprocess(val => (val === undefined ? undefined : Number(val)), z.number().positive().optional()),
  category: z.string().min(1).optional(),
  note: z.string().optional(),
});