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
export const getBudgetByUserAndMonth = async (userId: string, month: string) => {
  const data = await Budget.findOne({ userId, month });
  return data
};

/**
 * Checks budget usage against predefined thresholds and sends notifications.
 * This is a standalone service function to be called from other modules,
 * such as after an expense is created or updated.
 * @param userId - The user's ID.
 * @param month - The month in 'YYYY-MM' format.
 */
export const notifyOnBudgetThreshold = async (userId: string, month: string) => {
  const budget = await getBudgetByUserAndMonth(userId, month);
  if (!budget) return;

  const report = await getMonthlyReport(userId, month);
  const expense = report.totalExpense ?? 0;

  // Use totalBudget if set, otherwise use totalCategoryAmount
  const effectiveBudgetAmount = budget.totalBudget ?? budget.totalCategoryAmount;
  if (effectiveBudgetAmount === undefined || effectiveBudgetAmount <= 0) return;

  const usedPercent = (expense / effectiveBudgetAmount) * 100;
  const thresholds = [50, 75, 90, 100];

  for (const threshold of thresholds) {
    if (usedPercent >= threshold && !hasReachedThreshold(userId, month, threshold)) {
      await createNotification(
        {
          type: 'budget-warning',
          title: `You've used ${threshold}% of your ${budget.totalBudget ? 'monthly' : 'category'} budget!`,
          message: `You've spent ${threshold}% of your ${budget.totalBudget ? 'monthly' : 'category'} budget for ${month}`,
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
        message: `You've exceeded your ${budget.totalBudget ? 'monthly' : 'category'} budget for ${month}`,
        reportMonth: month.split('-')[1],
        reportYear: month.split('-')[0],
        budgetAmount: effectiveBudgetAmount,
        usedAmount: expense,
      },
      userId
    );
  }
};