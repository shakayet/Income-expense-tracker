/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { jest } from '@jest/globals';
import { addOrIncrementCategory, buildMonthlySummary } from '../budget.service';

// Mock Budget model and report service
jest.mock('../budget.model', () => ({
  Budget: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../reports/report.service', () => ({
  getMonthlyReport: jest.fn(),
}));

const { Budget } = jest.requireMock('../budget.model') as any;
const { getMonthlyReport } = jest.requireMock(
  '../../reports/report.service'
) as any;

describe('budget.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addOrIncrementCategory creates a new budget when none exists', async () => {
    (Budget.findOne as any).mockResolvedValue(null);
    const created = {
      userId: 'u1',
      month: '2025-12',
      categories: [{ categoryId: 'c1', amount: 10 }],
      totalCategoryAmount: 10,
    };
    (Budget.create as any).mockResolvedValue(created);

    const res = await addOrIncrementCategory('u1', '2025-12', 'c1', 10);

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
  });

  test('addOrIncrementCategory increments existing category amount and recalculates totals', async () => {
    const mockSave: any = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    const existing = {
      userId: 'u1',
      month: '2025-12',
      categories: [{ categoryId: 'c1', amount: 5 }],
      save: mockSave,
    } as any;
    (Budget.findOne as any).mockResolvedValue(existing);

    const res = await addOrIncrementCategory('u1', '2025-12', 'c1', 7);

    expect(existing.categories[0].amount).toBe(12);
    expect(existing.totalCategoryAmount).toBe(12);
    expect(mockSave).toHaveBeenCalled();
    expect(res).toBe(existing);
  });

  test('buildMonthlySummary returns aggregated summary using report data', async () => {
    const budgetDoc = {
      totalBudget: 100,
      totalCategoryAmount: 50,
      categories: [{ categoryId: 'c1', amount: 20 }],
    };
    (Budget.findOne as any).mockResolvedValue(budgetDoc);
    (getMonthlyReport as any).mockResolvedValue({
      totalExpense: 30,
      categories: [{ _id: 'c1', totalExpense: 10 }],
    });

    const summary = await buildMonthlySummary('u1', '2025-12');

    expect(summary.month).toBe('2025-12');
    expect(summary.totalBudget).toBe(100);
    expect(summary.totalExpense).toBe(30);
    expect(Array.isArray(summary.categories)).toBe(true);
    expect(summary.categories[0]).toMatchObject({
      category: 'c1',
      amount: 20,
      spent: 10,
    });
  });
});
