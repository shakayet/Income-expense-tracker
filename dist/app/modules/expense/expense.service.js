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
exports.getExpenseById = exports.deleteExpense = exports.updateExpense = exports.getExpensesByUser = exports.createExpense = void 0;
/* eslint-disable no-console */
const budget_service_1 = require("../budget/budget.service");
const expense_model_1 = __importDefault(require("./expense.model"));
const mongoose_1 = require("mongoose");
const createExpense = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const dateObj = data && typeof data.createdAt === 'string'
        ? new Date(data.createdAt)
        : new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const expense = yield expense_model_1.default.create(Object.assign(Object.assign({}, data), { userId: new mongoose_1.Types.ObjectId(userId), date: data.date || dateObj, month: data.month || `${year}-${month}` }));
    yield (0, budget_service_1.notifyOnBudgetThreshold)(userId, `${year}-${month}`); // ✅ notify expects string
    return expense;
});
exports.createExpense = createExpense;
const getExpensesByUser = (userId) => {
    return expense_model_1.default.find({ userId }).sort({ date: -1 });
};
exports.getExpensesByUser = getExpensesByUser;
const updateExpense = (id, userId, data) => {
    return expense_model_1.default.findOneAndUpdate({ _id: id, userId }, { $set: data }, {
        new: true,
        runValidators: true,
    });
};
exports.updateExpense = updateExpense;
const deleteExpense = (id, userId) => {
    return expense_model_1.default.findOneAndDelete({ _id: id, userId });
};
exports.deleteExpense = deleteExpense;
const getExpenseById = (id, userId) => {
    return expense_model_1.default.findOne({ _id: id, userId });
};
exports.getExpenseById = getExpenseById;
