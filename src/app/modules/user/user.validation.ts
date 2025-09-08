import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    contact: z.string({ required_error: 'Contact is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    preferredLanguage: z.string({ required_error: 'Location is required' }),
    profile: z.string().optional(),
    currency: z.string().optional(),
    pin: z.string().optional(),
    userType: z.enum(['pro', 'free']).optional(),
    accountStatus: z.enum(['active', 'ban']).optional(),
  }),
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  preferredLanguage: z.string().optional(),
  image: z.string().optional(),
  currency: z.string().optional(),
  pin: z.string().optional(),
  userType: z.enum(['pro', 'free']).optional(),
  accountStatus: z.enum(['active', 'ban']).optional(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
