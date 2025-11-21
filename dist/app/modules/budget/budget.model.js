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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Budget = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const budgetCategorySchema = new mongoose_1.Schema({
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category ID is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative'],
    },
}, { _id: false });
const budgetSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    month: {
        type: String,
        required: [true, 'Month is required'],
        match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (YYYY-MM)'],
    },
    totalBudget: {
        type: Number,
        min: [0, 'Total budget cannot be negative'],
    },
    categories: {
        type: [budgetCategorySchema],
        default: [],
    },
    totalCategoryAmount: {
        type: Number,
        default: 0,
        min: [0, 'Total category amount cannot be negative'],
    },
}, { timestamps: true });
// Validation: Ensure at least one budget type exists
budgetSchema.pre('validate', function (next) {
    if (this.totalBudget === undefined &&
        (!this.categories || this.categories.length === 0)) {
        return next(new Error('Either totalBudget or at least one category must be provided'));
    }
    next();
});
// Auto-calculate totalCategoryAmount before saving
budgetSchema.pre('save', function (next) {
    if (this.categories && this.categories.length > 0) {
        this.totalCategoryAmount = this.categories.reduce((total, category) => total + category.amount, 0);
    }
    else {
        this.totalCategoryAmount = 0;
    }
    next();
});
// Compound index for unique monthly budgets per user
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });
exports.Budget = mongoose_1.default.model('Budget', budgetSchema);
