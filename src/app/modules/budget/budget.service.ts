/* eslint-disable @typescript-eslint/no-explicit-any */
// Get only monthly budget and month for a user
import { createNotification } from '../notification/notification.service';
import { getMonthlyReport } from '../reports/report.service';
import { hasReachedThreshold } from '../../../util/notificationThresholdTracker';
import { Budget } from './budget.model';

/**
 * Retrieves a budget document by user ID and month.
 * @param userId - The user's ID.
 * @param month - The month in 'YYYY-MM' format.
 * @returns The budget document or null if not found.
 */
export const getBudgetByUserAndMonth = async (
  userId: string,
  month: string
) => {
  const data = await Budget.findOne({ userId, month });
  return data;
};

export const getUserMonthlyBudget = async (userId: string) => {
  // Assuming 'userId' field in budget model refers to userId
  // and 'month' and 'totalBudget' fields exist in the model
  return Budget.find({ userId }, { month: 1, totalBudget: 1, _id: 0 });
};

/**
 * Checks budget usage against predefined thresholds and sends notifications.
 * This is a standalone service function to be called from other modules,
 * such as after an expense is created or updated.
 * @param userId - The user's ID.
 * @param month - The month in 'YYYY-MM' format.
 */
export const notifyOnBudgetThreshold = async (
  userId: string,
  month: string
) => {
  const budget = await getBudgetByUserAndMonth(userId, month);
  if (!budget) return;

  const report = await getMonthlyReport(userId, month);
  const expense = report.totalExpense ?? 0;

  // Use totalBudget if set, otherwise use totalCategoryAmount
  const effectiveBudgetAmount =
    budget.totalBudget ?? budget.totalCategoryAmount;
  if (effectiveBudgetAmount === undefined || effectiveBudgetAmount <= 0) return;

  const usedPercent = (expense / effectiveBudgetAmount) * 100;
  const thresholds = [50, 75, 90, 100];

  for (const threshold of thresholds) {
    if (
      usedPercent >= threshold &&
      !hasReachedThreshold(userId, month, threshold)
    ) {
      await createNotification(
        {
          type: 'budget-warning',
          title: `You've used ${threshold}% of your ${
            budget.totalBudget ? 'monthly' : 'category'
          } budget!`,
          message: `You've spent ${threshold}% of your ${
            budget.totalBudget ? 'monthly' : 'category'
          } budget for ${month}`,
          reportMonth: month.split('-')[1],
          reportYear: month.split('-')[0],
          budgetAmount: effectiveBudgetAmount,
          usedAmount: expense,
        },
        userId
      );
    }
  }

  if (usedPercent > 100 && !hasReachedThreshold(userId, month, 101)) {
    await createNotification(
      {
        type: 'budget-warning',
        title: `Budget Exceeded!`,
        message: `You've exceeded your ${
          budget.totalBudget ? 'monthly' : 'category'
        } budget for ${month}`,
        reportMonth: month.split('-')[1],
        reportYear: month.split('-')[0],
        budgetAmount: effectiveBudgetAmount,
        usedAmount: expense,
      },
      userId
    );
  }
};

/**
 * Adds (or increments) a category budget for a user for a given month.
 * If budget doc doesn't exist it will be created. If category exists its amount is incremented.
 */
export const addOrIncrementCategory = async (
  userId: string,
  month: string,
  category: string,
  amount: number
) => {
  // find or create
  let budget = await Budget.findOne({ userId, month });
  if (!budget) {
    budget = await Budget.create({
      userId,
      month,
      categories: [{ categoryId: category, amount }],
    });
    return budget;
  }

  if (!Array.isArray(budget.categories)) budget.categories = [];

  const idx = budget.categories.findIndex(cat => cat.categoryId === category);
  if (idx !== -1) {
    budget.categories[idx].amount =
      (budget.categories[idx].amount ?? 0) + amount;
  } else {
    budget.categories.push({ categoryId: category, amount });
  }

  // Recalculate totalCategoryAmount
  budget.totalCategoryAmount = (budget.categories ?? []).reduce(
    (s, c) => s + (typeof c.amount === 'number' ? c.amount : 0),
    0
  );

  // If totalBudget exists, leave it; otherwise we keep it undefined
  await budget.save();
  return budget;
};

/**
 * Build a monthly summary for a user and month.
 */
export const buildMonthlySummary = async (userId: string, month: string) => {
  // Reuse existing report service to calculate expenses
  const report = await getMonthlyReport(userId, month);
  const reportAny: any = report;
  const totalExpense = reportAny.totalExpense ?? 0;

  const budget = await Budget.findOne({ userId, month });
  const totalBudget = budget?.totalBudget ?? budget?.totalCategoryAmount ?? 0;

  const totalPercentageUsed =
    totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

  const categories = (budget?.categories ?? []).map(cat => {
    const amount = typeof cat.amount === 'number' ? cat.amount : 0;
    // Try to get expense for this category from report.categories if available
    const catExpense =
      (reportAny.categories || []).find(
        (c: any) => String(c._id) === String(cat.categoryId)
      )?.totalExpense ?? 0;
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
};
