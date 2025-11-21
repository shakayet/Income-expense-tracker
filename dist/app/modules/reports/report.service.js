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
exports.getYearlyReport = exports.getMonthlyReport = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const income_model_1 = require("../income/income.model");
const expense_model_1 = __importDefault(require("../expense/expense.model"));
const budget_model_1 = require("../budget/budget.model");
const getMonthlyReport = (userId, month) => __awaiter(void 0, void 0, void 0, function* () {
    const incomes = yield income_model_1.Income.find({ userId, month });
    const expenses = yield expense_model_1.default.find({
        userId,
        createdAt: {
            $gte: new Date(`${month}-01`),
            $lt: new Date(`${month}-31T23:59:59.999Z`),
        },
    });
    const budgetDoc = yield budget_model_1.Budget.findOne({ userId, month });
    const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
    const totalExpense = expenses.reduce((acc, item) => acc + item.amount, 0);
    const incomeByCategory = {};
    const expenseByCategory = {};
    for (const i of incomes)
        incomeByCategory[i.source] = (incomeByCategory[i.source] || 0) + i.amount;
    for (const e of expenses) {
        // Expense model uses `source` for the category/source field
        const catKey = e.source ? String(e.source) : 'unknown';
        expenseByCategory[catKey] = (expenseByCategory[catKey] || 0) + e.amount;
    }
    const incomeCategoryPercentage = Object.entries(incomeByCategory)
        .map(([category, amount]) => ({
        category,
        amount,
        percentage: Number((totalIncome > 0 ? (amount / totalIncome) * 100 : 0).toFixed(2)),
    }))
        .sort((a, b) => b.percentage - a.percentage);
    const expenseCategoryPercentage = Object.entries(expenseByCategory)
        .map(([category, amount]) => ({
        category,
        amount,
        percentage: Number((totalExpense > 0 ? (amount / totalExpense) * 100 : 0).toFixed(2)),
    }))
        .sort((a, b) => b.percentage - a.percentage);
    // Fix: Access totalBudget directly from the document
    const budget = (budgetDoc === null || budgetDoc === void 0 ? void 0 : budgetDoc.totalBudget) || 0;
    const savings = (totalIncome - totalExpense).toFixed(2);
    // Avoid division by zero
    const budgetUsedPercentage = budget > 0 ? ((totalExpense / budget) * 100).toFixed(2) : '0.00';
    return {
        month,
        budget,
        totalIncome,
        totalExpense,
        savings,
        budgetUsedPercentage,
        incomeCategoryPercentage,
        expenseCategoryPercentage,
    };
});
exports.getMonthlyReport = getMonthlyReport;
const getYearlyReport = (userId, year) => __awaiter(void 0, void 0, void 0, function* () {
    const incomeDocs = yield income_model_1.Income.find({
        userId,
        month: { $regex: `^${year}-` },
    });
    const expenseDocs = yield expense_model_1.default.find({
        userId,
        createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year}-12-31T23:59:59.999Z`),
        },
    });
    const budgets = yield budget_model_1.Budget.find({ userId, month: { $regex: `^${year}-` } });
    const totalIncome = incomeDocs.reduce((acc, item) => acc + item.amount, 0);
    const totalExpense = expenseDocs.reduce((acc, item) => acc + item.amount, 0);
    // Fix: Access amount directly from budget documents
    const totalBudget = budgets.reduce((acc, b) => acc + (b.amount || 0), 0);
    const incomeByCategory = {};
    const expenseByCategory = {};
    for (const i of incomeDocs)
        incomeByCategory[i.source] = (incomeByCategory[i.source] || 0) + i.amount;
    for (const e of expenseDocs) {
        // Expense model uses `source` for the category/source field
        const catKey = e.source ? String(e.source) : 'unknown';
        expenseByCategory[catKey] = (expenseByCategory[catKey] || 0) + e.amount;
    }
    const incomeCategoryPercentage = Object.entries(incomeByCategory)
        .map(([category, amount]) => ({
        category,
        amount,
        percentage: Number((totalIncome > 0 ? (amount / totalIncome) * 100 : 0).toFixed(2)),
    }))
        .sort((a, b) => b.percentage - a.percentage);
    const expenseCategoryPercentage = Object.entries(expenseByCategory)
        .map(([category, amount]) => ({
        category,
        amount,
        percentage: Number((totalExpense > 0 ? (amount / totalExpense) * 100 : 0).toFixed(2)),
    }))
        .sort((a, b) => b.percentage - a.percentage);
    const savings = (totalIncome - totalExpense).toFixed(2);
    // Avoid division by zero
    const budgetUsedPercentage = totalBudget > 0 ? ((totalExpense / totalBudget) * 100).toFixed(2) : '0.00';
    return {
        year,
        totalBudget,
        totalIncome,
        totalExpense,
        savings,
        budgetUsedPercentage,
        incomeCategoryPercentage,
        expenseCategoryPercentage,
    };
});
exports.getYearlyReport = getYearlyReport;
