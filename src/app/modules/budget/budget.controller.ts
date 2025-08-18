import { Request, Response } from 'express';
// import { Income } from '../income/income.model';
import Expense from '../expense/expense.model';
import { createNotification } from '../notification/notification.service';
import { hasReachedThreshold } from '../../../util/notificationThresholdTracker';
import { getMonthlyReport } from '../reports/report.service';
import mongoose from 'mongoose';

export const setOrUpdateBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { month, amount } = req.body;

    let budget = await Budget.findOne({ userId, month });

    if (budget) {
      budget.amount = amount;
      await budget.save();
    } else {
      budget = await Budget.create({ userId, month, amount });
    }

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to set budget', error });
  }
};

export const getBudgetDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const month = req.params.month;
    if (!month.match(/^\d{4}-(0[1-9]|1[0-2])$/)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid month format (YYYY-MM)' });
    }

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not set for this month' });
    }

    // Calculate total expenses for the month
    const expensesAgg = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: new Date(`${month}-01T00:00:00Z`),
            $lt: new Date(
              new Date(`${month}-01T00:00:00Z`).setMonth(
                new Date(`${month}-01T00:00:00Z`).getMonth() + 1
              )
            ),
          },
        },
      },
      { $group: { _id: null, totalExpense: { $sum: '$amount' } } },
    ]);

    const totalExpense = expensesAgg.length ? expensesAgg[0].totalExpense : 0;
    const remaining = budget.amount - totalExpense;
    const percentageLeft =
      budget.amount > 0 ? (remaining / budget.amount) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        budgetAmount: budget.amount.toFixed(2),
        totalExpense: totalExpense.toFixed(2),
        remaining: remaining.toFixed(2),
        percentageLeft: percentageLeft.toFixed(2),
        percentageUsed: (100 - percentageLeft).toFixed(2),
        month,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to get budget details', error });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    const { month } = req.params;
    const { amount } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const budget = await Budget.findOneAndUpdate(
      { userId, month },
      { amount },
      { new: true, upsert: false }
    );

    if (!budget) {
      return res
        .status(404)
        .json({
          success: false,
          message: 'Budget not found for the given month',
        });
    }

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to update budget', error });
  }
};

import { Budget } from './budget.model';

export const getBudgetByUserAndMonth = async (
  userId: string,
  month: string
) => {
  return Budget.findOne({ userId, month });
};

export const checkAndNotifyBudgetUsage = async (
  userId: string,
  monthKey: string
) => {
  const budget = await getBudgetByUserAndMonth(userId, monthKey);
  // console.log("Checking budget usage for user:", budget);
  // console.log("it's working: ",budget);
  if (!budget) return;

  const report = await getMonthlyReport(userId, monthKey);
  const expense = report.totalExpense ?? 0;
  const budgetAmount = budget.amount;
  const usedPercent = (expense / budgetAmount) * 100;

  const thresholds = [50, 75, 90, 100];
  // it's working:

  for (const threshold of thresholds) {
    // console.log(hasReachedThreshold(userId, monthKey, threshold))

    if (
      usedPercent >= threshold &&
      hasReachedThreshold(userId, monthKey, threshold)
    ) {
      await createNotification(
        {
          type: 'budget-warning',
          title: `You've used ${threshold}% of your budget!`,
          message: `You’ve spent ${threshold}% of your monthly budget for ${monthKey}`,
          reportMonth: monthKey.split('-')[1],
          reportYear: monthKey.split('-')[0],
          budgetAmount: budgetAmount,
          usedAmount: expense,
        },
        userId
      );
    }
  }

  if (usedPercent > 100 && hasReachedThreshold(userId, monthKey, 101)) {
    await createNotification(
      {
        type: 'budget-warning',
        title: `Budget Exceeded!`,
        message: `You’ve exceeded your monthly budget for ${monthKey}`,
        reportMonth: monthKey.split('-')[1],
        reportYear: monthKey.split('-')[0],
        budgetAmount: budgetAmount,
        usedAmount: expense,
      },
      userId
    );
  }
};
