"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryZodSchema = void 0;
const zod_1 = require("zod");
exports.createCategoryZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Category name is required'),
        icon: zod_1.z.string().min(1, 'Icon is required'),
    }),
});
