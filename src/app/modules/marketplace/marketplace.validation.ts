import { z } from 'zod';

export const MarketplaceValidations = {
  create: z.object({
    name: z.string(),
    price: z.number(),
    image: z.string(),
    marketplace: z.string(),
    productUrl: z.string(),
  }),

  update: z.object({
    name: z.string().optional(),
    price: z.number().optional(),
    image: z.string().optional(),
    marketplace: z.string().optional(),
    productUrl: z.string().optional(),
  }),
};

export const createSearchTypeZod = z.object({
  body: z.object({
    type: z.enum(['GENERIC', 'API']),
  }),
});
