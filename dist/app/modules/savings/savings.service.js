"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsService = void 0;
const savings_model_1 = require("./savings.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createSavings = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const savingsValue = data.initialPrice - data.actualPrice;
    const newSavings = yield savings_model_1.Savings.create(Object.assign(Object.assign({}, data), { 
        // categoryName: data.category, // Store category name at creation time
        savings: savingsValue }));
    return newSavings;
});
const getAllSavings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return savings_model_1.Savings.find({ userId }).sort({ createdAt: -1 });
});
const getSavingsSummaryByCategory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const summary = yield savings_model_1.Savings.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
            },
        },
        {
            $group: {
                _id: '$category',
                totalInitial: { $sum: '$initialPrice' },
                totalActual: { $sum: '$actualPrice' },
                totalSavings: { $sum: '$savings' },
            },
        },
        { $sort: { totalSavings: -1 } },
    ]);
    return summary.map(item => ({
        category: item._id,
        totalInitial: item.totalInitial,
        totalActual: item.totalActual,
        totalSavings: item.totalSavings,
    }));
});
exports.SavingsService = {
    createSavings,
    getAllSavings,
    getSavingsSummaryByCategory,
};
