"use strict";
// zod for input validation schemas for expense module
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseUpdateSchema = exports.createExpenseZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createExpenseZodSchema = zod_1.default.object({
    body: zod_1.default.object({
        amount: zod_1.default.number(),
        source: zod_1.default.string(),
        note: zod_1.default.string().optional(),
    }),
});
exports.expenseUpdateSchema = zod_1.default.object({
    amount: zod_1.default.number().optional(),
    source: zod_1.default.string().optional(),
    month: zod_1.default.string().optional(),
    date: zod_1.default.string().datetime().optional()
});
