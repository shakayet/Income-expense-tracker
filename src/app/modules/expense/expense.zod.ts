import { z } from 'zod';

export const expenseCreateSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  note: z.string().optional(),
  date: z.string().datetime(),
});

export const expenseUpdateSchema = z.object({
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  note: z.string().optional(),
  date: z.string().datetime().optional(),
});