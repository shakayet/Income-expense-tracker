"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSavingsZodSchema = void 0;
const zod_1 = require("zod");
exports.createSavingsZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().optional(), // can attach later from token
        category: zod_1.z.string({ required_error: 'Category is required' }),
        initialPrice: zod_1.z.number({ required_error: 'Initial price is required' }),
        actualPrice: zod_1.z.number({ required_error: 'Actual price is required' }),
    }),
});
