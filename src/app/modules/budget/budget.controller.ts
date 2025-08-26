/* eslint-disable no-console */
import { Request, Response } from 'express';
import { Budget } from './budget.model';
import mongoose from 'mongoose';
import {
  // notifyOnBudgetThreshold,
  getBudgetByUserAndMonth,
} from './budget.service';
import Expense from '../expense/expense.model';

// Set a budget with specific categories
export const setOrUpdateBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month, categories } = req.body;

    let budget = await Budget.findOne({ userId, month });

    if (budget) {
      budget.categories = categories;
      await budget.save();
    } else {
      budget = await Budget.create({ userId, month, categories });
    }

    res.status(200).json({
      success: true,
      message: 'Budget categories set successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Error setting budget categories:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to set budget', error });
  }
};

// Set a monthly total budget (without categories)
export const setMonthlyBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month, totalBudget } = req.body;

    let budget = await Budget.findOne({ userId, month });

    if (budget) {
      budget.totalBudget = totalBudget;
      await budget.save();
    } else {
      // Create new budget, totalBudget is now required according to schema
      budget = await Budget.create({
        userId,
        month,
        totalBudget,
        categories: [],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Monthly budget set successfully',
      data: {
        month: budget.month,
        totalBudget: budget.totalBudget,
        totalCategoryAmount: budget.totalCategoryAmount,
        categories: budget.categories,
      },
    });
  } catch (error) {
    console.error('Error setting monthly budget:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to set monthly budget', error });
  }
};

// Update a monthly total budget
export const updateMonthlyBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month } = req.params;
    const { totalBudget } = req.body;

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not found for this month' });
    }

    budget.totalBudget = totalBudget;
    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Monthly budget updated successfully',
      data: {
        month: budget.month,
        totalBudget: budget.totalBudget,
        totalCategoryAmount: budget.totalCategoryAmount,
        categories: budget.categories,
      },
    });
  } catch (error) {
      console.error('Error updating monthly budget:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to update monthly budget', error });
    }
};

// Add a new category to an existing budget or create a new one
export const addBudgetCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month } = req.params;
    const { category, amount } = req.body;

    let budget = await Budget.findOne({ userId, month });

    if (!budget) {
      budget = await Budget.create({
        userId,
        month,
        categories: [{ category, amount }],
      });
    } else {
      const existingCategoryIndex = budget.categories?.findIndex(
        (cat) => cat.category.toLowerCase() === category.toLowerCase()
      );

      if (existingCategoryIndex !== undefined && existingCategoryIndex >= 0) {
        budget.categories![existingCategoryIndex].amount = amount;
      } else {
        budget.categories?.push({ category, amount });
      }

      await budget.save();
    }

    res.status(200).json({
      success: true,
      message: `Budget category '${category}' added/updated successfully`,
      data: budget,
    });
  } catch (error) {
      console.error('Error adding budget category:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to add budget category', error });
  }
};

// Update a specific category within an existing budget
export const updateBudgetCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month, category } = req.params;
    const { amount } = req.body;

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not found for this month' });
    }

    const categoryIndex = budget.categories?.findIndex(
      (cat) => cat.category.toLowerCase() === category.toLowerCase()
    );

    if (categoryIndex === undefined || categoryIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found in budget' });
    }

    budget.categories![categoryIndex].amount = amount;
    await budget.save();

    res.status(200).json({
      success: true,
      message: `Budget category '${category}' updated successfully`,
      data: {
        month: budget.month,
        totalBudget: budget.totalBudget,
        totalCategoryAmount: budget.totalCategoryAmount,
        categories: budget.categories,
        updatedCategory: { category, amount },
      },
    });
  } catch (error) {
    console.error('Error updating budget category:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update budget category', error });
  }
};

// Delete a specific category from an existing budget
export const deleteBudgetCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month, category } = req.params;

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not found for this month' });
    }

    const initialLength = budget.categories?.length;
    budget.categories = budget.categories?.filter(
      (cat) => cat.category.toLowerCase() !== category.toLowerCase()
    );

    if (!budget.categories || budget.categories.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found in budget' });
    }

    await budget.save();

    res.status(200).json({
      success: true,
      message: `Budget category '${category}' deleted successfully`,
      data: {
        month: budget.month,
        totalBudget: budget.totalBudget,
        totalCategoryAmount: budget.totalCategoryAmount,
        categories: budget.categories,
      },
    });
  } catch (error) {
    console.error('Error deleting budget category:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete budget category', error });
  }
};

// Get budget details, including expense tracking
export const getBudgetDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const month = req.params.month;

    const budget = await getBudgetByUserAndMonth(userId, month);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not set for this month' });
    }

    // Calculate total expenses for the month by category
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
      {
        $group: {
          _id: '$category',
          totalExpense: { $sum: '$amount' },
        },
      },
    ]);

    const expenseMap = new Map(
      expensesAgg.map((exp) => [exp._id, exp.totalExpense])
    );
    const totalExpense = expensesAgg.reduce((sum, exp) => sum + exp.totalExpense, 0);

    const effectiveTotalBudget = budget.totalBudget ?? budget.totalCategoryAmount;
    const totalRemaining = (effectiveTotalBudget ?? 0) - totalExpense;
    const totalPercentageUsed =
      effectiveTotalBudget && effectiveTotalBudget > 0
        ? (totalExpense / effectiveTotalBudget) * 100
        : 0;

    const categories = budget.categories ?? [];
    const categoryDetails = categories.map((budgetCategory) => {
      const spent = expenseMap.get(budgetCategory.category) || 0;
      const remaining = budgetCategory.amount - spent;
      const percentageUsed =
        budgetCategory.amount > 0 ? (spent / budgetCategory.amount) * 100 : 0;
      
      const percentageOfTotalBudget =
        effectiveTotalBudget && effectiveTotalBudget > 0
          ? (budgetCategory.amount / effectiveTotalBudget) * 100
          : 0;

      return {
        category: budgetCategory.category,
        budgetAmount: budgetCategory.amount.toFixed(2),
        spent: spent.toFixed(2),
        remaining: remaining.toFixed(2),
        percentageUsed: percentageUsed.toFixed(2),
        percentageOfTotalBudget: percentageOfTotalBudget.toFixed(2), // New field added
        status:
          percentageUsed >= 100
            ? 'exceeded'
            : percentageUsed >= 80
            ? 'warning'
            : 'good',
      };
    });

    res.status(200).json({
      success: true,
      data: {
        month,
        totalBudget: budget.totalBudget?.toFixed(2) ?? null,
        totalCategoryAmount: budget.totalCategoryAmount?.toFixed(2) ?? null,
        effectiveTotalBudget: effectiveTotalBudget?.toFixed(2) ?? '0.00',
        totalExpense: totalExpense.toFixed(2),
        totalRemaining: totalRemaining.toFixed(2),
        totalPercentageUsed: totalPercentageUsed.toFixed(2),
        totalPercentageLeft: (100 - totalPercentageUsed).toFixed(2),
        categories: categoryDetails,
        summary: {
          totalCategories: categories.length,
          categoriesExceeded: categoryDetails.filter(
            (cat) => cat.status === 'exceeded'
          ).length,
          categoriesInWarning: categoryDetails.filter(
            (cat) => cat.status === 'warning'
          ).length,
          categoriesGood: categoryDetails.filter(
            (cat) => cat.status === 'good'
          ).length,
          budgetType: budget.totalBudget ? 'monthly_budget_set' : 'category_budgets_only',
        },
      },
    });
  } catch (error) {
    console.error('Error getting budget details:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to get budget details', error });
  }
};