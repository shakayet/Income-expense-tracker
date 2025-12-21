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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMonthlySummary = exports.addOrIncrementCategory = exports.notifyOnBudgetThreshold = exports.getUserMonthlyBudget = exports.getBudgetByUserAndMonth = void 0;
// Get only monthly budget and month for a user
const notification_service_1 = require("../notification/notification.service");
const report_service_1 = require("../reports/report.service");
const notificationThresholdTracker_1 = require("../../../util/notificationThresholdTracker");
const budget_model_1 = require("./budget.model");
/**
 * Retrieves a budget document by user ID and month.
 * @param userId - The user's ID.
 * @param month - The month in 'YYYY-MM' format.
 * @returns The budget document or null if not found.
 */
const getBudgetByUserAndMonth = (userId, month) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield budget_model_1.Budget.findOne({ userId, month });
    return data;
});
exports.getBudgetByUserAndMonth = getBudgetByUserAndMonth;
const getUserMonthlyBudget = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Assuming 'userId' field in budget model refers to userId
    // and 'month' and 'totalBudget' fields exist in the model
    return budget_model_1.Budget.find({ userId }, { month: 1, totalBudget: 1, _id: 0 });
});
exports.getUserMonthlyBudget = getUserMonthlyBudget;
/**
 * Checks budget usage against predefined thresholds and sends notifications.
 * This is a standalone service function to be called from other modules,
 * such as after an expense is created or updated.
 * @param userId - The user's ID.
 * @param month - The month in 'YYYY-MM' format.
 */
const notifyOnBudgetThreshold = (userId, month) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const budget = yield (0, exports.getBudgetByUserAndMonth)(userId, month);
    if (!budget)
        return;
    const report = yield (0, report_service_1.getMonthlyReport)(userId, month);
    const expense = (_a = report.totalExpense) !== null && _a !== void 0 ? _a : 0;
    // Use totalBudget if set, otherwise use totalCategoryAmount
    const effectiveBudgetAmount = (_b = budget.totalBudget) !== null && _b !== void 0 ? _b : budget.totalCategoryAmount;
    if (effectiveBudgetAmount === undefined || effectiveBudgetAmount <= 0)
        return;
    const usedPercent = (expense / effectiveBudgetAmount) * 100;
    const thresholds = [50, 75, 90, 100];
    for (const threshold of thresholds) {
        if (usedPercent >= threshold &&
            !(0, notificationThresholdTracker_1.hasReachedThreshold)(userId, month, threshold)) {
            yield (0, notification_service_1.createNotification)({
                type: 'budget-warning',
                title: `You've used ${threshold}% of your ${budget.totalBudget ? 'monthly' : 'category'} budget!`,
                message: `You've spent ${threshold}% of your ${budget.totalBudget ? 'monthly' : 'category'} budget for ${month}`,
                reportMonth: month.split('-')[1],
                reportYear: month.split('-')[0],
                budgetAmount: effectiveBudgetAmount,
                usedAmount: expense,
            }, userId);
        }
    }
    if (usedPercent > 100 && !(0, notificationThresholdTracker_1.hasReachedThreshold)(userId, month, 101)) {
        yield (0, notification_service_1.createNotification)({
            type: 'budget-warning',
            title: `Budget Exceeded!`,
            message: `You've exceeded your ${budget.totalBudget ? 'monthly' : 'category'} budget for ${month}`,
            reportMonth: month.split('-')[1],
            reportYear: month.split('-')[0],
            budgetAmount: effectiveBudgetAmount,
            usedAmount: expense,
        }, userId);
    }
});
exports.notifyOnBudgetThreshold = notifyOnBudgetThreshold;
/**
 * Adds (or increments) a category budget for a user for a given month.
 * If budget doc doesn't exist it will be created. If category exists its amount is incremented.
 */
const addOrIncrementCategory = (userId, month, category, amount) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // find or create
    let budget = yield budget_model_1.Budget.findOne({ userId, month });
    if (!budget) {
        budget = yield budget_model_1.Budget.create({
            userId,
            month,
            categories: [{ categoryId: category, amount }],
        });
        return budget;
    }
    if (!Array.isArray(budget.categories))
        budget.categories = [];
    const idx = budget.categories.findIndex(cat => cat.categoryId === category);
    if (idx !== -1) {
        budget.categories[idx].amount =
            ((_a = budget.categories[idx].amount) !== null && _a !== void 0 ? _a : 0) + amount;
    }
    else {
        budget.categories.push({ categoryId: category, amount });
    }
    // Recalculate totalCategoryAmount
    budget.totalCategoryAmount = ((_b = budget.categories) !== null && _b !== void 0 ? _b : []).reduce((s, c) => s + (typeof c.amount === 'number' ? c.amount : 0), 0);
    // If totalBudget exists, leave it; otherwise we keep it undefined
    yield budget.save();
    return budget;
});
exports.addOrIncrementCategory = addOrIncrementCategory;
/**
 * Build a monthly summary for a user and month.
 */
const buildMonthlySummary = (userId, month) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    // Reuse existing report service to calculate expenses
    const report = yield (0, report_service_1.getMonthlyReport)(userId, month);
    const reportAny = report;
    const totalExpense = (_a = reportAny.totalExpense) !== null && _a !== void 0 ? _a : 0;
    const budget = yield budget_model_1.Budget.findOne({ userId, month });
    const totalBudget = (_c = (_b = budget === null || budget === void 0 ? void 0 : budget.totalBudget) !== null && _b !== void 0 ? _b : budget === null || budget === void 0 ? void 0 : budget.totalCategoryAmount) !== null && _c !== void 0 ? _c : 0;
    const totalPercentageUsed = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;
    const categories = ((_d = budget === null || budget === void 0 ? void 0 : budget.categories) !== null && _d !== void 0 ? _d : []).map(cat => {
        var _a, _b;
        const amount = typeof cat.amount === 'number' ? cat.amount : 0;
        // Try to get expense for this category from report.categories if available
        const catExpense = (_b = (_a = (reportAny.categories || []).find((c) => String(c._id) === String(cat.categoryId))) === null || _a === void 0 ? void 0 : _a.totalExpense) !== null && _b !== void 0 ? _b : 0;
        const percentageUsed = totalBudget > 0 ? (amount / totalBudget) * 100 : 0;
        return {
            category: cat.categoryId,
            amount,
            percentageUsed: percentageUsed,
            spent: catExpense,
        };
    });
    return {
        month,
        totalBudget,
        totalExpense,
        totalPercentageUsed,
        categories,
    };
});
exports.buildMonthlySummary = buildMonthlySummary;
