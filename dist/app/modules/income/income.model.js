"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Income = exports.IncomeCategory = void 0;
const mongoose_1 = require("mongoose");
const incomeSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    source: {
        type: String,
        // enum: ['salary', 'business', 'gift', 'rent', 'freelancing', 'others'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    month: {
        type: String,
        required: true,
    }
});
const incomeCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: null },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
exports.IncomeCategory = (0, mongoose_1.model)('IncomeCategory', incomeCategorySchema);
exports.Income = (0, mongoose_1.model)('Income', incomeSchema);
