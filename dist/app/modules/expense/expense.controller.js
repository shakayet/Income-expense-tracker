"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getMonthlyExpenseSummaryForPdf = exports.deleteIncomeCategory = exports.getExpenseCategories = exports.updateExpenseCategory = exports.createExpenseCategory = exports.getMonthlyExpenseSummary = exports.getExpense = exports.deleteExpense = exports.updateExpense = exports.getExpenses = exports.createExpense = void 0;
const expenseService = __importStar(require("./expense.service"));
const expense_zod_1 = require("./expense.zod");
const mongoose_1 = __importStar(require("mongoose"));
// import { Category } from '../category/category.model';
const expense_model_1 = __importStar(require("./expense.model"));
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userId = req.user.id; // keep string here for function params
        const { source, amount, month } = req.body;
        const now = new Date();
        const expense = yield expenseService.createExpense(userId, {
            userId: new mongoose_1.Types.ObjectId(userId), // ✅ Mongoose expects ObjectId
            source,
            amount: Number(amount),
            date: now,
            month: month ||
                `${now.getFullYear()}-${(now.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}`,
        });
        return res.status(201).json({
            success: true,
            data: expense,
        });
    }
    catch (error) {
        console.error('Error creating expense:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
exports.createExpense = createExpense;
const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = new mongoose_1.Types.ObjectId(req.user.id);
    const expenses = yield expenseService.getExpensesByUser(userId);
    res.status(200).json({
        success: true,
        data: expenses,
    });
});
exports.getExpenses = getExpenses;
const updateExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = new mongoose_1.Types.ObjectId(req.user.id);
    // Validate request body using Zod
    const validated = expense_zod_1.expenseUpdateSchema.safeParse(req.body);
    if (!validated.success) {
        return res.status(400).json(validated.error);
    }
    const updateData = validated.data;
    // Since Expense model uses "source", NOT "category", no category validation is needed anymore
    // Prepare payload based on model fields
    const updatePayload = {
        amount: updateData.amount,
        source: updateData.source,
        month: updateData.month,
        date: updateData.date,
    };
    // Remove undefined fields so they don't overwrite existing values
    Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === undefined) {
            delete updatePayload[key];
        }
    });
    const expense = yield expenseService.updateExpense(id, userId, updatePayload);
    if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
    }
    return res.json(expense);
});
exports.updateExpense = updateExpense;
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = new mongoose_1.Types.ObjectId(req.user.id);
    const result = yield expenseService.deleteExpense(id, userId);
    if (!result)
        return res.status(404).json({ message: 'Expense not found' });
    res.json(result);
});
exports.deleteExpense = deleteExpense;
const getExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        return res.status(400).json({ message: 'Invalid expense ID' });
    }
    const userId = new mongoose_1.Types.ObjectId(req.user.id);
    const expense = yield expenseService.getExpenseById(id, userId);
    if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
});
exports.getExpense = getExpense;
const getMonthlyExpenseSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Prefer month from params (as requested), fallback to query
        const monthParam = (_b = req.params) === null || _b === void 0 ? void 0 : _b.month;
        let month = monthParam !== null && monthParam !== void 0 ? monthParam : req.query.month;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        // Auto-detect current month if not provided
        if (!month) {
            const now = new Date();
            const year = now.getFullYear();
            const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
            month = `${year}-${monthNum}`;
        }
        // Validate month format YYYY-MM
        if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid month format. Use YYYY-MM' });
        }
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 1);
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        // Simplified pipeline - group by source field directly
        const pipeline = [
            {
                $match: {
                    userId: userObjectId,
                    $or: [
                        { month: month },
                        { date: { $gte: startDate, $lt: endDate } },
                        { createdAt: { $gte: startDate, $lt: endDate } },
                    ],
                },
            },
            {
                $group: {
                    _id: '$source', // Group by the source field which contains category
                    totalAmount: { $sum: '$amount' },
                },
            },
            {
                $project: {
                    _id: 0,
                    categoryName: '$_id',
                    totalAmount: 1,
                },
            },
            { $sort: { totalAmount: -1 } },
        ];
        const summary = yield expense_model_1.default.aggregate(pipeline);
        const totalExpense = summary.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
        // Calculate percentage for each category
        const breakdownWithPercentage = summary.map(item => ({
            source: item.categoryName,
            amount: item.totalAmount,
            percentage: totalExpense > 0
                ? Math.round((item.totalAmount / totalExpense) * 100 * 100) / 100 // Rounds to 2 decimal places
                : 0,
        }));
        return res.status(200).json({
            success: true,
            data: {
                month,
                totalExpense,
                breakdown: breakdownWithPercentage,
            },
        });
    }
    catch (error) {
        console.error('getMonthlyExpenseSummary error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly expense summary',
            error,
        });
    }
});
exports.getMonthlyExpenseSummary = getMonthlyExpenseSummary;
const createExpenseCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, icon } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required',
            });
        }
        // 🔍 Check if category already exists for this user
        const existingCategory = yield expense_model_1.ExpenseCategory.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }, // case-insensitive match
            userId,
        });
        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: 'This expense category already exists.',
            });
        }
        const category = yield expense_model_1.ExpenseCategory.create({ name, icon, userId });
        res.status(201).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({
            success: false,
            message: 'Failed to create income category',
            error,
        });
    }
});
exports.createExpenseCategory = createExpenseCategory;
const updateExpenseCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const categoryId = req.params.id;
        const { name, icon } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!mongoose_1.default.Types.ObjectId.isValid(categoryId))
            return res
                .status(400)
                .json({ success: false, message: 'Invalid category id' });
        const updated = yield expense_model_1.ExpenseCategory.findOneAndUpdate({ _id: categoryId, userId }, { name, icon }, { new: true });
        if (!updated)
            return res.status(404).json({
                success: false,
                message: 'Category not found or unauthorized',
            });
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update income category',
            error,
        });
    }
});
exports.updateExpenseCategory = updateExpenseCategory;
const getExpenseCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const categories = yield expense_model_1.ExpenseCategory.find({
            $or: [{ userId: null }, { userId }],
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense categories',
            error,
        });
    }
});
exports.getExpenseCategories = getExpenseCategories;
const deleteIncomeCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const categoryId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!mongoose_1.default.Types.ObjectId.isValid(categoryId))
            return res
                .status(400)
                .json({ success: false, message: 'Invalid category id' });
        const deleted = yield expense_model_1.ExpenseCategory.findOneAndDelete({
            _id: categoryId,
            userId,
        });
        if (!deleted)
            return res.status(404).json({
                success: false,
                message: 'Category not found or unauthorized',
            });
        res
            .status(200)
            .json({ success: true, message: 'Income category deleted successfully' });
    }
    catch (error) {
        res
            .status(500)
            .json({
            success: false,
            message: 'Failed to delete income category',
            error,
        });
    }
});
exports.deleteIncomeCategory = deleteIncomeCategory;
const getMonthlyExpenseSummaryForPdf = (userId, month) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 1);
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        // Simplified pipeline - group by source field directly
        const pipeline = [
            {
                $match: {
                    userId: userObjectId,
                    $or: [
                        { month: month },
                        { date: { $gte: startDate, $lt: endDate } },
                        { createdAt: { $gte: startDate, $lt: endDate } },
                    ],
                },
            },
            {
                $group: {
                    _id: '$source', // Group by the source field which contains category
                    totalAmount: { $sum: '$amount' },
                },
            },
            {
                $project: {
                    _id: 0,
                    categoryName: '$_id',
                    totalAmount: 1,
                },
            },
            { $sort: { totalAmount: -1 } },
        ];
        const summary = yield expense_model_1.default.aggregate(pipeline);
        const totalExpense = summary.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
        // Calculate percentage for each category
        const breakdownWithPercentage = summary.map(item => ({
            source: item.categoryName,
            amount: item.totalAmount,
            percentage: totalExpense > 0
                ? Math.round((item.totalAmount / totalExpense) * 100 * 100) / 100 // Rounds to 2 decimal places
                : 0,
        }));
        return {
            data: {
                month,
                totalExpense,
                breakdown: breakdownWithPercentage,
            },
        };
    }
    catch (error) {
        console.error('getMonthlyExpenseSummary error:', error);
        return {
            success: false,
            message: 'Failed to fetch monthly expense summary',
            error,
        };
    }
});
exports.getMonthlyExpenseSummaryForPdf = getMonthlyExpenseSummaryForPdf;
