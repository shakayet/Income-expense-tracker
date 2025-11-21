"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Savings = void 0;
const mongoose_1 = require("mongoose");
const savingsSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    initialPrice: { type: Number, required: true },
    actualPrice: { type: Number, required: true },
    savings: { type: Number, required: true },
}, { timestamps: true });
exports.Savings = (0, mongoose_1.model)('Savings', savingsSchema);
