import { z } from 'zod';

export const setBudgetZodSchema = z.object({
  body: z.object({
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (YYYY-MM)'),
    amount: z.number().positive(),
  }),
});

export const updateBudgetZodSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
  }),
});
