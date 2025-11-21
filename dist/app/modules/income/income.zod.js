"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIncomeZodSchema = void 0;
const zod_1 = require("zod");
exports.createIncomeZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        source: zod_1.z.enum([
            'salary',
            'business',
            'gift',
            'rent',
            'freelancing',
            'others',
        ]),
        amount: zod_1.z.number(),
    }),
});
