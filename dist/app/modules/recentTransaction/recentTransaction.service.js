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
exports.getRecentTransactions = void 0;
const income_model_1 = require("../income/income.model");
// import IncomeModel from '../income/income.model';
const expense_model_1 = __importDefault(require("../expense/expense.model"));
const getRecentTransactions = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    // Fetch incomes & expenses
    const incomes = yield income_model_1.Income.find({ userId })
        .select('_id source amount date')
        .lean();
    const expenses = yield expense_model_1.default.find({ userId })
        .select('_id source amount createdAt')
        .lean();
    // Normalize into common structure
    const transactions = [
        ...incomes.map(i => ({
            _id: i._id.toString(),
            type: 'income',
            title: typeof i.source === 'string' ? i.source : String(i.source),
            amount: i.amount,
            createdAt: i.date instanceof Date ? i.date : new Date(i.date),
        })),
        ...expenses.map(e => ({
            _id: e._id.toString(),
            type: 'expense',
            title: typeof e.source === 'string' ? e.source : String(e.source),
            amount: e.amount,
            createdAt: e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt),
        })),
    ];
    // Ensure createdAt is a Date object for all transactions
    transactions.forEach(t => {
        if (!(t.createdAt instanceof Date)) {
            t.createdAt = new Date(t.createdAt);
        }
    });
    // Sort by latest
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    // Paginate
    const paginated = transactions.slice(skip, skip + limit);
    // Format response
    const formatted = paginated.map(t => ({
        _id: t._id,
        title: t.type === 'income' ? `${t.title} Deposit` : t.title,
        type: t.type,
        amount: t.type === 'income' ? `+${t.amount}` : `-${t.amount}`,
        time: formatDate(t.createdAt),
    }));
    return {
        transactions: formatted,
        total: transactions.length,
        page,
        limit,
    };
});
exports.getRecentTransactions = getRecentTransactions;
// Helper to format dates
function formatDate(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const d = date.toDateString();
    if (d === today.toDateString())
        return 'Today';
    if (d === yesterday.toDateString())
        return 'Yesterday';
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
}
