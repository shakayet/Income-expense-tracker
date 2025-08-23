import { Request, Response } from 'express';
import Expense from '../expense/expense.model';
import { createNotification } from '../notification/notification.service';
import { hasReachedThreshold } from '../../../util/notificationThresholdTracker';
import { getMonthlyReport } from '../reports/report.service';
import mongoose from 'mongoose';
import { Budget } from './budget.model';

export const setOrUpdateBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { month, category, amount } = req.body;

    let budget = await Budget.findOne({ userId, month });

    if (budget) {
      // Check if category already exists
      const categoryIndex = budget.categories.findIndex(
        cat => cat.category === category
      );

      if (categoryIndex > -1) {
        // Update existing category
        budget.categories[categoryIndex].amount = amount;
      } else {
        // Add new category
        budget.categories.push({ category, amount });
      }
      
      await budget.save();
    } else {
      // Create new budget with the category
      budget = await Budget.create({ 
        userId, 
        month, 
        categories: [{ category, amount }] 
      });
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

    // Calculate expenses by category
    const expensesByCategory = await Expense.aggregate([
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
      {
        $group: {
          _id: '$category',
          totalExpense: { $sum: '$amount' }
        }
      }
    ]);

    // Create a map of expenses by category
    const expenseMap = new Map();
    expensesByCategory.forEach(item => {
      expenseMap.set(item._id, item.totalExpense);
    });

    // Calculate category details with spending information
    const categoryDetails = budget.categories.map(cat => {
      const spent = expenseMap.get(cat.category) || 0;
      
      return {
        category: cat.category,
        budgeted: cat.amount,
        spent: spent,
        remaining: cat.amount - spent,
        percentage: cat.percentage,
        spentPercentage: cat.amount > 0 ? (spent / cat.amount) * 100 : 0
      };
    });

    // Calculate total expenses
    const totalExpense = expensesByCategory.reduce((sum, item) => sum + item.totalExpense, 0);
    const remaining = budget.totalAmount - totalExpense;
    const percentageLeft = budget.totalAmount > 0 ? (remaining / budget.totalAmount) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalBudget: budget.totalAmount.toFixed(2),
        totalExpense: totalExpense.toFixed(2),
        remaining: remaining.toFixed(2),
        percentageLeft: percentageLeft.toFixed(2),
        percentageUsed: (100 - percentageLeft).toFixed(2),
        month,
        categories: categoryDetails
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
    const { category, amount } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const budget = await Budget.findOne({ userId, month });
    
    if (!budget) {
      return res
        .status(404)
        .json({
          success: false,
          message: 'Budget not found for the given month',
        });
    }

    // Find the category and update it
    const categoryIndex = budget.categories.findIndex(
      cat => cat.category === category
    );

    if (categoryIndex === -1) {
      return res
        .status(404)
        .json({
          success: false,
          message: 'Category not found in budget',
        });
    }

    budget.categories[categoryIndex].amount = amount;
    await budget.save();

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to update budget', error });
  }
};

export const removeBudgetCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    const { month, category } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const budget = await Budget.findOne({ userId, month });
    
    if (!budget) {
      return res
        .status(404)
        .json({
          success: false,
          message: 'Budget not found for the given month',
        });
    }

    // Remove the category
    budget.categories = budget.categories.filter(
      cat => cat.category !== category
    );
    
    await budget.save();

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to remove category', error });
  }
};

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
  if (!budget) return;

  const report = await getMonthlyReport(userId, monthKey);
  const expense = report.totalExpense ?? 0;
  const usedPercent = budget.totalAmount > 0 ? (expense / budget.totalAmount) * 100 : 0;

  const thresholds = [50, 75, 90, 100];

  for (const threshold of thresholds) {
    if (
      usedPercent >= threshold &&
      hasReachedThreshold(userId, monthKey, threshold)
    ) {
      await createNotification(
        {
          type: 'budget-warning',
          title: `You've used ${threshold}% of your budget!`,
          message: `You've spent ${threshold}% of your monthly budget for ${monthKey}`,
          reportMonth: monthKey.split('-')[1],
          reportYear: monthKey.split('-')[0],
          budgetAmount: budget.totalAmount,
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
        message: `You've exceeded your monthly budget for ${monthKey}`,
        reportMonth: monthKey.split('-')[1],
        reportYear: monthKey.split('-')[0],
        budgetAmount: budget.totalAmount,
        usedAmount: expense,
      },
      userId
    );
  }
};