import { z } from 'zod';

export const MarketplacecredentialValidations = {
  create: z.object({
    body: z.object({
      marketplaceName: z.string(),
      api_key: z.string().optional(),
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      refreshToken: z.string().optional(),
      awsAccessKeyId: z.string().optional(),
      awsSecretAccessKey: z.string().optional(),
      marketplaceId: z.string().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      refreshToken: z.string().optional(),
      awsAccessKeyId: z.string().optional(),
      awsSecretAccessKey: z.string().optional(),
      marketplaceId: z.string().optional(),
      environment: z.string().optional(),
    }),
  }),
};
