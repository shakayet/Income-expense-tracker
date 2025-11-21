"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        contact: zod_1.z.string({ required_error: 'Contact is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        preferredLanguage: zod_1.z.string({ required_error: 'Location is required' }),
        profile: zod_1.z.string().optional(),
        currency: zod_1.z.string().optional(),
        pin: zod_1.z.string().optional(),
        userType: zod_1.z.enum(['pro', 'free']).optional(),
        accountStatus: zod_1.z.enum(['active', 'ban']).optional(),
    }),
});
const updateUserZodSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    contact: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
    preferredLanguage: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
    pin: zod_1.z.string().optional(),
    userType: zod_1.z.enum(['pro', 'free']).optional(),
    accountStatus: zod_1.z.enum(['active', 'ban']).optional(),
});
exports.UserValidation = {
    createUserZodSchema,
    updateUserZodSchema,
};
