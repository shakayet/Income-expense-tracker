import { Request, Response } from 'express';
import { Budget } from './budget.model';
import { Income } from '../income/income.model';
import Expense from '../expense/expense.model';

export const setOrUpdateBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
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
    res.status(500).json({ success: false, message: 'Failed to set budget', error });
  }
};

export const getBudgetDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const month = req.params.month;
    if (!month.match(/^\d{4}-(0[1-9]|1[0-2])$/)) {
      return res.status(400).json({ success: false, message: 'Invalid month format (YYYY-MM)' });
    }

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not set for this month' });
    }

    // Calculate total expenses for the month
    const expensesAgg = await Expense.aggregate([
      { $match: { userId: new (require('mongoose').Types.ObjectId)(userId), createdAt: {
          $gte: new Date(`${month}-01T00:00:00Z`),
          $lt: new Date(new Date(`${month}-01T00:00:00Z`).setMonth(new Date(`${month}-01T00:00:00Z`).getMonth() + 1)),
        }
      }},
      { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
    ]);

    const totalExpense = expensesAgg.length ? expensesAgg[0].totalExpense : 0;

    const remaining = budget.amount - totalExpense;
    const percentageLeft = budget.amount > 0 ? (remaining / budget.amount) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        budgetAmount: budget.amount,
        totalExpense,
        remaining: remaining < 0 ? 0 : remaining,
        percentageLeft: percentageLeft < 0 ? 0 : +percentageLeft.toFixed(2),
        month,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get budget details', error });
  }
};