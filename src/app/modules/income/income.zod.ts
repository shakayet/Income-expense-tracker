import { z } from 'zod';

export const createIncomeZodSchema = z.object({
    body: z.object({
        source: z.enum(['salary', 'business', 'gift', 'rent']),
        amount: z.number(),
  }),
});