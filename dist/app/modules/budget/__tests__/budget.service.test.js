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
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
const globals_1 = require("@jest/globals");
const budget_service_1 = require("../budget.service");
// Mock Budget model and report service
globals_1.jest.mock('../budget.model', () => ({
    Budget: {
        findOne: globals_1.jest.fn(),
        create: globals_1.jest.fn(),
    },
}));
globals_1.jest.mock('../../reports/report.service', () => ({
    getMonthlyReport: globals_1.jest.fn(),
}));
const { Budget } = globals_1.jest.requireMock('../budget.model');
const { getMonthlyReport } = globals_1.jest.requireMock('../../reports/report.service');
describe('budget.service', () => {
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
    });
    test('addOrIncrementCategory creates a new budget when none exists', () => __awaiter(void 0, void 0, void 0, function* () {
        Budget.findOne.mockResolvedValue(null);
        const created = {
            userId: 'u1',
            month: '2025-12',
            categories: [{ categoryId: 'c1', amount: 10 }],
            totalCategoryAmount: 10,
        };
        Budget.create.mockResolvedValue(created);
        const res = yield (0, budget_service_1.addOrIncrementCategory)('u1', '2025-12', 'c1', 10);
        expect(Budget.findOne).toHaveBeenCalledWith({
            userId: 'u1',
            month: '2025-12',
        });
        expect(Budget.create).toHaveBeenCalledWith({
            userId: 'u1',
            month: '2025-12',
            categories: [{ categoryId: 'c1', amount: 10 }],
        });
        expect(res).toBe(created);
    }));
    test('addOrIncrementCategory increments existing category amount and recalculates totals', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockSave = globals_1.jest
            .fn()
            .mockImplementation(() => Promise.resolve(true));
        const existing = {
            userId: 'u1',
            month: '2025-12',
            categories: [{ categoryId: 'c1', amount: 5 }],
            save: mockSave,
        };
        Budget.findOne.mockResolvedValue(existing);
        const res = yield (0, budget_service_1.addOrIncrementCategory)('u1', '2025-12', 'c1', 7);
        expect(existing.categories[0].amount).toBe(12);
        expect(existing.totalCategoryAmount).toBe(12);
        expect(mockSave).toHaveBeenCalled();
        expect(res).toBe(existing);
    }));
    test('buildMonthlySummary returns aggregated summary using report data', () => __awaiter(void 0, void 0, void 0, function* () {
        const budgetDoc = {
            totalBudget: 100,
            totalCategoryAmount: 50,
            categories: [{ categoryId: 'c1', amount: 20 }],
        };
        Budget.findOne.mockResolvedValue(budgetDoc);
        getMonthlyReport.mockResolvedValue({
            totalExpense: 30,
            categories: [{ _id: 'c1', totalExpense: 10 }],
        });
        const summary = yield (0, budget_service_1.buildMonthlySummary)('u1', '2025-12');
        expect(summary.month).toBe('2025-12');
        expect(summary.totalBudget).toBe(100);
        expect(summary.totalExpense).toBe(30);
        expect(Array.isArray(summary.categories)).toBe(true);
        expect(summary.categories[0]).toMatchObject({
            category: 'c1',
            amount: 20,
            spent: 10,
        });
    }));
});
