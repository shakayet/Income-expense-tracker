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
exports.getMonthlyIncomeSummaryForPdf = exports.deleteIncomeCategory = exports.getIncomeCategories = exports.updateIncomeCategory = exports.createIncomeCategory = exports.getMonthlyIncomeSummary = exports.getAllIncomes = exports.deleteIncome = exports.updateIncome = exports.createIncome = void 0;
const income_model_1 = require("./income.model");
const mongoose_1 = __importDefault(require("mongoose"));
const getUserIdFromReq = (req) => {
    // supports different shapes where middleware may attach user info
    const user = req.user;
    if (!user)
        return null;
    return user.id || user._id || null;
};
const createIncome = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { source, amount, month } = req.body;
        const userId = getUserIdFromReq(req);
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!source || typeof amount === 'undefined') {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: source and amount',
            });
        }
        const now = new Date();
        const income = yield income_model_1.Income.create({
            source,
            amount: Number(amount),
            date: now,
            month: month ||
                `${now.getFullYear()}-${(now.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}`,
            userId,
        });
        res.status(201).json({ success: true, data: income });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: 'Failed to create income', error });
    }
});
exports.createIncome = createIncome;
const updateIncome = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const incomeId = req.params.id;
        const userId = getUserIdFromReq(req);
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!mongoose_1.default.Types.ObjectId.isValid(incomeId))
            return res
                .status(400)
                .json({ success: false, message: 'Invalid income id' });
        const updated = yield income_model_1.Income.findOneAndUpdate({ _id: incomeId, userId }, Object.assign({}, req.body), { new: true });
        if (!updated)
            return res
                .status(404)
                .json({ success: false, message: 'Income not found or unauthorized' });
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: 'Failed to update income', error });
    }
});
exports.updateIncome = updateIncome;
const deleteIncome = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const incomeId = req.params.id;
        const userId = getUserIdFromReq(req);
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!mongoose_1.default.Types.ObjectId.isValid(incomeId))
            return res
                .status(400)
                .json({ success: false, message: 'Invalid income id' });
        const deleted = yield income_model_1.Income.findOneAndDelete({ _id: incomeId, userId });
        if (!deleted)
            return res
                .status(404)
                .json({ success: false, message: 'Income not found or unauthorized' });
        res
            .status(200)
            .json({ success: true, message: 'Income deleted successfully' });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: 'Failed to delete income', error });
    }
});
exports.deleteIncome = deleteIncome;
const getAllIncomes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = getUserIdFromReq(req);
        const { month, page = '1', limit = '10' } = req.query;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        // Build filter object
        const filter = { userId };
        // Add month filter if provided (sanitize)
        if (month && typeof month === 'string') {
            filter.month = month;
        }
        // Calculate pagination
        const pageNum = Math.max(1, parseInt(page || '1'));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit || '10')));
        const skip = (pageNum - 1) * limitNum;
        // Get incomes with pagination
        const incomes = yield income_model_1.Income.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum);
        // Get total count for pagination info
        const total = yield income_model_1.Income.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: incomes,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum,
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: 'Failed to fetch incomes', error });
    }
});
exports.getAllIncomes = getAllIncomes;
const getMonthlyIncomeSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = getUserIdFromReq(req);
        let { month } = req.query;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        // Auto-detect current month if not provided
        if (!month || typeof month !== 'string') {
            const now = new Date();
            const year = now.getFullYear();
            const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
            month = `${year}-${monthNum}`;
        }
        // Convert userId to ObjectId
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const summary = yield income_model_1.Income.aggregate([
            { $match: { userId: userObjectId, month } },
            { $group: { _id: '$source', totalAmount: { $sum: '$amount' } } },
        ]);
        const totalIncome = summary.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
        res.status(200).json({
            success: true,
            data: {
                month,
                totalIncome,
                breakdown: summary.map((item) => ({
                    source: item._id,
                    amount: item.totalAmount,
                })),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly income summary',
            error,
        });
    }
});
exports.getMonthlyIncomeSummary = getMonthlyIncomeSummary;
const createIncomeCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, icon } = req.body;
        const userId = getUserIdFromReq(req);
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!name) {
            return res
                .status(400)
                .json({
                success: false,
                message: 'Name is required',
            });
        }
        // 🔍 Check if category already exists for this user
        const existing = yield income_model_1.IncomeCategory.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }, // case-insensitive match
            userId,
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This income category already exists.',
            });
        }
        const category = yield income_model_1.IncomeCategory.create({ name, icon, userId });
        return res.status(201).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create income category',
            error,
        });
    }
});
exports.createIncomeCategory = createIncomeCategory;
const updateIncomeCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = req.params.id;
        const { name, icon } = req.body;
        const userId = getUserIdFromReq(req);
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!mongoose_1.default.Types.ObjectId.isValid(categoryId))
            return res
                .status(400)
                .json({ success: false, message: 'Invalid category id' });
        const updated = yield income_model_1.IncomeCategory.findOneAndUpdate({ _id: categoryId, userId }, { name, icon }, { new: true });
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
exports.updateIncomeCategory = updateIncomeCategory;
const getIncomeCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = getUserIdFromReq(req);
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const categories = yield income_model_1.IncomeCategory.find({
            $or: [{ userId: null }, { userId }],
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch income categories',
            error,
        });
    }
});
exports.getIncomeCategories = getIncomeCategories;
// Delete income category
const deleteIncomeCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = req.params.id;
        const userId = getUserIdFromReq(req);
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!mongoose_1.default.Types.ObjectId.isValid(categoryId))
            return res
                .status(400)
                .json({ success: false, message: 'Invalid category id' });
        const deleted = yield income_model_1.IncomeCategory.findOneAndDelete({
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
        res.status(500).json({
            success: false,
            message: 'Failed to delete income category',
            error,
        });
    }
});
exports.deleteIncomeCategory = deleteIncomeCategory;
const getMonthlyIncomeSummaryForPdf = (userId, month) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Auto-detect current month if not provided
        if (!month || typeof month !== 'string') {
            const now = new Date();
            const year = now.getFullYear();
            const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
            month = `${year}-${monthNum}`;
        }
        // Convert userId to ObjectId
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const summary = yield income_model_1.Income.aggregate([
            { $match: { userId: userObjectId, month } },
            { $group: { _id: '$source', totalAmount: { $sum: '$amount' } } },
        ]);
        const totalIncome = summary.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
        return {
            data: {
                month,
                totalIncome,
                breakdown: summary.map((item) => ({
                    source: item._id,
                    amount: item.totalAmount,
                })),
            },
        };
    }
    catch (error) {
        return {
            message: 'Failed to fetch monthly income summary',
            error,
        };
    }
});
exports.getMonthlyIncomeSummaryForPdf = getMonthlyIncomeSummaryForPdf;
