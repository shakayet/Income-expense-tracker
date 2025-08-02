import { z } from 'zod';

export const createCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required'),
    icon: z.string().min(1, 'Icon is required'),
  }),
});
