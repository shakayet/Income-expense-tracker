import { z } from 'zod';

export const createSavingsZodSchema = z.object({
  body: z.object({
    userId: z.string().optional(), // can attach later from token
    category: z.string({ required_error: 'Category is required' }),
    initialPrice: z.number({ required_error: 'Initial price is required' }),
    actualPrice: z.number({ required_error: 'Actual price is required' }),
  }),
});
