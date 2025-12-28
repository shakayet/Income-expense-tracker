/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Request, Response } from 'express';
import { Budget } from './budget.model';
import mongoose from 'mongoose';
// import Expense from '../expense/expense.model';
import process from 'process';
import {
  notifyOnBudgetThreshold,
  addOrIncrementCategory,
  buildMonthlySummary,
  getBudgetByUserAndMonth,
} from './budget.service';

// Get only monthly budget and month for a user
export const getMonthlyBudgetAndMonth = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Month query parameter is required' });
    }
    const budget = await Budget.findOne(
      { userId, month },
      { month: 1, totalBudget: 1, _id: 0 }
    );
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'No budget found for this month' });
    }
    res.status(200).json({
      success: true,
      message: 'Monthly budget and month fetched successfully',
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly budget',
      error,
    });
  }
};

// POST accumulative budget for current month
export const postAccumulativeBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { category, amount } = req.body;
    if (amount === undefined || typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'amount is required and must be a non-negative number',
      });
    }

    // Detect current month server-side
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}`;

    let budget;
    // If category provided, treat as accumulative category budget increment
    if (category && typeof category === 'string' && category.trim()) {
      budget = await addOrIncrementCategory(userId, month, category, amount);
    } else {
      // No category provided: add to an "Uncategorized" category
      const uncategorizedId = 'Uncategorized';
      budget = await addOrIncrementCategory(
        userId,
        month,
        uncategorizedId,
        amount
      );
    }

    // Trigger notifications check (reuse existing notifier)
    try {
      await notifyOnBudgetThreshold(userId, month);
    } catch (e) {
      console.warn('notifyOnBudgetThreshold failed', e);
    }

    return res.status(200).json({
      success: true,
      message: 'Budget posted',
      data: (() => {
        const obj: any = JSON.parse(JSON.stringify(budget));
        delete obj.totalBudget;
        return obj;
      })(),
    });
  } catch (error) {
    console.error('Error in postAccumulativeBudget:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Set or update a budget with an array of categories
export const setOrUpdateBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { month, categories, totalBudget } = req.body;

    if (!month || typeof month !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Month is required and must be a string in YYYY-MM format',
      });
    }

    if (
      (!Array.isArray(categories) || categories.length === 0) &&
      totalBudget === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Either non-empty categories array or totalBudget must be provided',
      });
    }

    let parsedCategories: any[] | undefined;
    if (Array.isArray(categories)) {
      parsedCategories = categories.map((cat: any) => {
        if (!cat.categoryId || cat.amount === undefined) {
          throw new Error('Each category must have categoryId and amount');
        }
        if (typeof cat.categoryId !== 'string') {
          throw new Error('categoryId must be a string');
        }
        return {
          categoryId: cat.categoryId,
          amount: cat.amount,
        };
      });
    }

    let budget = await Budget.findOne({ userId, month });
    if (budget) {
      if (parsedCategories) budget.categories = parsedCategories as any;
      if (totalBudget !== undefined) budget.totalBudget = totalBudget;
      await budget.save();
    } else {
      budget = await Budget.create({
        userId,
        month,
        categories: parsedCategories ?? [],
        totalBudget: totalBudget,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget saved successfully',
      data: (() => {
        const obj: any = JSON.parse(JSON.stringify(budget));
        delete obj.totalBudget;
        return obj;
      })(),
    });
  } catch (error) {
    console.error('Error setting budget categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set budget categories',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
};

// Update or replace a budget for a given month (PUT /:month)
export const updateBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { month } = req.params;
    const {
      categories,
      totalBudget,
      categoryId: bodyCategoryId,
      category: bodyCategory,
      categoryDocId,
      _id: bodySubId,
      amount: bodyAmount,
    } = req.body;

    if (!month || typeof month !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Month param required' });
    }

    // If a single category identifier is provided, treat this as a category-level update
    const categoryIdentifier =
      bodyCategoryId || bodyCategory || categoryDocId || bodySubId;

    if (categoryIdentifier) {
      if (bodyAmount === undefined || typeof bodyAmount !== 'number') {
        return res.status(400).json({
          success: false,
          message:
            'amount is required to update a category and must be a number',
        });
      }

      const budget = await Budget.findOne({ userId, month });
      if (!budget) {
        return res
          .status(404)
          .json({ success: false, message: 'Budget not found' });
      }

      const idx = budget.categories?.findIndex(cat => {
        if (!cat) return false;
        if (cat._id && String(cat._id) === String(categoryIdentifier))
          return true;
        return cat.categoryId === categoryIdentifier;
      });

      if (idx === undefined || idx === -1) {
        return res
          .status(404)
          .json({ success: false, message: 'Category not found in budget' });
      }

      budget.categories![idx].amount = bodyAmount;
      await budget.save();

      return res.status(200).json({
        success: true,
        message: `Budget category '${categoryIdentifier}' updated successfully`,
        data: {
          month: budget.month,
          totalCategoryAmount: budget.totalCategoryAmount,
          categories: budget.categories,
          updatedCategory: {
            categoryId: categoryIdentifier,
            amount: bodyAmount,
          },
        },
      });
    }

    // Bulk update (replace categories array) or update totalBudget
    if (
      (!Array.isArray(categories) || categories.length === 0) &&
      totalBudget === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Either non-empty categories array or totalBudget must be provided',
      });
    }

    let parsedCategories: any[] | undefined;
    if (Array.isArray(categories)) {
      parsedCategories = categories.map((cat: any) => {
        if (!cat.categoryId || cat.amount === undefined) {
          throw new Error('Each category must have categoryId and amount');
        }
        return { categoryId: String(cat.categoryId), amount: cat.amount };
      });
    }

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not found' });
    }

    if (parsedCategories) budget.categories = parsedCategories as any;
    if (totalBudget !== undefined) budget.totalBudget = totalBudget;
    await budget.save();

    return res
      .status(200)
      .json({ success: true, message: 'Budget updated', data: budget });
  } catch (error) {
    console.error('Error updating budget:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete a budget for a given month
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { month } = req.params;
    if (!month || typeof month !== 'string')
      return res.status(400).json({ message: 'month param required' });

    // If a category identifier is provided in body or query, delete that category only
    const categoryIdentifier =
      (req.body &&
        (req.body.categoryId || req.body.category || req.body._id)) ||
      req.query.categoryId ||
      req.query.category;

    if (categoryIdentifier) {
      const budget = await Budget.findOne({ userId, month });
      if (!budget)
        return res
          .status(404)
          .json({ success: false, message: 'Budget not found' });

      const idx = budget.categories?.findIndex(cat => {
        if (!cat) return false;
        if (cat._id && String(cat._id) === String(categoryIdentifier))
          return true;
        return cat.categoryId === categoryIdentifier;
      });

      if (idx === undefined || idx === -1) {
        return res
          .status(404)
          .json({ success: false, message: 'Category not found in budget' });
      }

      budget.categories!.splice(idx, 1);
      await budget.save();

      return res.status(200).json({
        success: true,
        message: `Budget category '${categoryIdentifier}' deleted successfully`,
        data: {
          month: budget.month,
          totalCategoryAmount: budget.totalCategoryAmount,
          categories: budget.categories,
        },
      });
    }

    const budget = await Budget.findOneAndDelete({ userId, month });
    if (!budget)
      return res
        .status(404)
        .json({ success: false, message: 'Budget not found' });

    return res
      .status(200)
      .json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
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
    res.status(500).json({
      success: false,
      message: 'Failed to update monthly budget',
      error,
    });
  }
};

// Add a new category to an existing budget or create a new one
export const addBudgetCategory = async (req: Request, res: Response) => {
  try {
    const userIdRaw = (req.user as { id?: string } | undefined)?.id;
    if (!userIdRaw) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = new mongoose.Types.ObjectId(userIdRaw);
    const { month } = req.params;
    const { categoryId, amount } = req.body;
    if (!categoryId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Category ID and amount are required',
      });
    }
    if (typeof categoryId !== 'string' || !categoryId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Category ID',
      });
    }
    let budget = await Budget.findOne({ userId, month });
    if (!budget) {
      budget = await Budget.create({
        userId,
        month,
        categories: [{ categoryId, amount }],
      });
    } else {
      if (!Array.isArray(budget.categories)) {
        budget.categories = [];
      }
      const existingCategoryIndex = budget.categories.findIndex(
        cat => cat.categoryId === categoryId
      );
      if (existingCategoryIndex !== -1) {
        budget.categories[existingCategoryIndex].amount = amount;
      } else {
        budget.categories = budget.categories.filter(cat => cat.categoryId);
        budget.categories.push({ categoryId, amount });
      }
      await budget.save();
    }
    res.status(200).json({
      success: true,
      message: 'Budget category added successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Error adding budget category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add budget category',
      error,
    });
  }
};

// Update a specific category within an existing budget
export const updateBudgetCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month } = req.params;
    const categoryId =
      (req.params as any).category || (req.params as any).categoryId;
    const { amount } = req.body;

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not found for this month' });
    }

    const categoryIndex = budget.categories?.findIndex(cat => {
      if (!cat) return false;
      // Match by subdocument _id first, then by categoryId string
      if (cat._id && String(cat._id) === String(categoryId)) return true;
      return cat.categoryId === categoryId;
    });

    if (categoryIndex === undefined || categoryIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found in budget' });
    }

    budget.categories![categoryIndex].amount = amount;
    await budget.save();

    res.status(200).json({
      success: true,
      message: `Budget category '${categoryId}' updated successfully`,
      data: {
        month: budget.month,
        // totalBudget: budget.totalBudget,
        totalCategoryAmount: budget.totalCategoryAmount,
        categories: budget.categories,
        updatedCategory: { categoryId, amount },
      },
    });
  } catch (error) {
    console.error('Error updating budget category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget category',
      error,
    });
  }
};

// Delete a specific category from an existing budget
export const deleteBudgetCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month } = req.params;
    const categoryId =
      (req.params as any).category || (req.params as any).categoryId;

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not found for this month' });
    }

    const initialLength = budget.categories?.length ?? 0;
    const idx = budget.categories?.findIndex(cat => {
      if (!cat) return false;
      if (cat._id && String(cat._id) === String(categoryId)) return true;
      return cat.categoryId === categoryId;
    });

    if (idx === undefined || idx === -1) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found in budget' });
    }

    // remove the found category
    budget.categories!.splice(idx, 1);
    await budget.save();

    res.status(200).json({
      success: true,
      message: `Budget category '${categoryId}' deleted successfully`,
      data: {
        month: budget.month,
        totalBudget: budget.totalBudget,
        totalCategoryAmount: budget.totalCategoryAmount,
        categories: budget.categories,
      },
    });
  } catch (error) {
    console.error('Error deleting budget category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete budget category',
      error,
    });
  }
};

export const getBudgetDetails = async (req: Request, res: Response) => {
  const userId = (req.user as { id?: string } | undefined)?.id;
  try {
    const { month } = req.params;

    if (!userId || !month) {
      return res
        .status(400)
        .json({ success: false, message: 'userId and month are required' });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);

    const budgetResult = await Budget.aggregate([
      {
        $match: { userId: userIdObj, month },
      },
      // Expenses lookup
      {
        $lookup: {
          from: 'expenses',
          let: { budgetUserId: '$userId', budgetMonth: '$month' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', userIdObj] },
                    {
                      $gte: [
                        '$createdAt',
                        new Date(`${month}-01T00:00:00.000Z`),
                      ],
                    },
                    {
                      $lt: [
                        '$createdAt',
                        new Date(`${month}-31T23:59:59.999Z`),
                      ],
                    },
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$source',
                totalSpent: { $sum: '$amount' },
              },
            },
          ],
          as: 'expensesByCategory',
        },
      },
      // Incomes lookup
      {
        $lookup: {
          from: 'incomes',
          let: { budgetUserId: '$userId', budgetMonth: '$month' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', userIdObj] },
                    { $eq: ['$month', month] }, // month field already stored in your incomes
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalIncome: { $sum: '$amount' },
              },
            },
          ],
          as: 'incomeSummary',
        },
      },
      {
        $addFields: {
          totalIncome: {
            $ifNull: [{ $arrayElemAt: ['$incomeSummary.totalIncome', 0] }, 0],
          },
        },
      },
      // Categories handling
      {
        $addFields: {
          categories: {
            $map: {
              input: { $ifNull: ['$categories', []] },
              as: 'cat',
              in: {
                _id: '$$cat._id',
                categoryId: '$$cat.categoryId',
                amount: '$$cat.amount',
                spent: {
                  $let: {
                    vars: {
                      spentEntry: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$expensesByCategory',
                              cond: {
                                $eq: [
                                  {
                                    $toLower: {
                                      $trim: {
                                        input: { $toString: '$$this._id' },
                                      },
                                    },
                                  },
                                  {
                                    $toLower: {
                                      $trim: { input: '$$cat.categoryId' },
                                    },
                                  },
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: { $ifNull: ['$$spentEntry.totalSpent', 0] },
                  },
                },
              },
            },
          },
        },
      },
      // Calculate category fields
      {
        $addFields: {
          categories: {
            $map: {
              input: '$categories',
              as: 'cat',
              in: {
                _id: '$$cat._id',
                categoryId: '$$cat.categoryId',
                budgetAmount: '$$cat.amount',
                spent: '$$cat.spent',
                remaining: { $subtract: ['$$cat.amount', '$$cat.spent'] },
                percentageUsed: {
                  $cond: [
                    { $gt: ['$$cat.amount', 0] },
                    {
                      $multiply: [
                        { $divide: ['$$cat.spent', '$$cat.amount'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                status: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $gt: [
                            {
                              $multiply: [
                                { $divide: ['$$cat.spent', '$$cat.amount'] },
                                100,
                              ],
                            },
                            100,
                          ],
                        },
                        then: 'exceeded',
                      },
                      {
                        case: {
                          $gt: [
                            {
                              $multiply: [
                                { $divide: ['$$cat.spent', '$$cat.amount'] },
                                100,
                              ],
                            },
                            80,
                          ],
                        },
                        then: 'warning',
                      },
                    ],
                    default: 'good',
                  },
                },
              },
            },
          },
        },
      },
      // TotalExpense & effective budget
      {
        $addFields: {
          // If categories array exists and has items, sum their spent values;
          // otherwise fall back to summing the aggregated expensesByCategory totals.
          totalExpense: {
            $cond: [
              { $gt: [{ $size: '$categories' }, 0] },
              { $sum: '$categories.spent' },
              { $sum: '$expensesByCategory.totalSpent' },
            ],
          },
          effectiveTotalBudget: {
            $cond: [
              { $gt: ['$totalBudget', 0] },
              '$totalBudget',
              '$totalCategoryAmount',
            ],
          },
        },
      },
      // Projection
      {
        $project: {
          _id: 0,
          month: 1,
          // totalIncome: { $toString: '$totalIncome' }, // 🔹 new field
          // totalBudget: { $toString: { $round: ['$effectiveTotalBudget', 2] } },
          totalCategoryAmount: {
            $toString: { $round: ['$totalCategoryAmount', 2] },
          },
          // totalCategoryAmount: {
          //   $toString: { $round: ['$totalCategoryAmount', 2] },
          // },
          // effectiveTotalBudget: {
          //   $toString: { $round: ['$effectiveTotalBudget', 2] },
          // },
          totalExpense: { $toString: { $round: ['$totalExpense', 2] } },
          // totalRemaining: {
          //   $toString: {
          //     $round: [
          //       { $subtract: ['$effectiveTotalBudget', '$totalExpense'] },
          //       2,
          //     ],
          //   },
          // },
          totalPercentageUsed: {
            $toString: {
              $round: [
                {
                  $cond: [
                    { $gt: ['$effectiveTotalBudget', 0] },
                    {
                      $multiply: [
                        { $divide: ['$totalExpense', '$effectiveTotalBudget'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                2,
              ],
            },
          },
          // totalPercentageLeft: {
          //   $toString: {
          //     $round: [
          //       {
          //         $cond: [
          //           { $gt: ['$effectiveTotalBudget', 0] },
          //           {
          //             $subtract: [
          //               100,
          //               {
          //                 $multiply: [
          //                   {
          //                     $divide: [
          //                       '$totalExpense',
          //                       '$effectiveTotalBudget',
          //                     ],
          //                   },
          //                   100,
          //                 ],
          //               },
          //             ],
          //           },
          //           0,
          //         ],
          //       },
          //       2,
          //     ],
          //   },
          // },
          categories: {
            $map: {
              input: '$categories',
              as: 'cat',
              in: {
                categoryId: { $toString: '$$cat.categoryId' },
                id: { $toString: '$$cat._id' },
                budgetAmount: {
                  $toString: { $round: ['$$cat.budgetAmount', 2] },
                },
                spent: { $toString: { $round: ['$$cat.spent', 2] } },
                remaining: { $toString: { $round: ['$$cat.remaining', 2] } },
                percentageUsed: {
                  $toString: { $round: ['$$cat.percentageUsed', 2] },
                },
                status: '$$cat.status',
              },
            },
          },
          // summary: {
          //   totalCategories: { $size: '$categories' },
          //   categoriesExceeded: {
          //     $size: {
          //       $filter: {
          //         input: '$categories',
          //         as: 'cat',
          //         cond: { $eq: ['$$cat.status', 'exceeded'] },
          //       },
          //     },
          //   },
          //   categoriesInWarning: {
          //     $size: {
          //       $filter: {
          //         input: '$categories',
          //         as: 'cat',
          //         cond: { $eq: ['$$cat.status', 'warning'] },
          //       },
          //     },
          //   },
          //   categoriesGood: {
          //     $size: {
          //       $filter: {
          //         input: '$categories',
          //         as: 'cat',
          //         cond: { $eq: ['$$cat.status', 'good'] },
          //       },
          //     },
          //   },
          //   budgetType: {
          //     $cond: [
          //       { $gt: ['$totalBudget', 0] },
          //       'monthly_budget_set',
          //       'category_only_budget',
          //     ],
          //   },
          // },
        },
      },
    ]);

    if (!budgetResult || budgetResult.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not found' });
    }

    return res.json({ success: true, data: budgetResult[0] });
  } catch (error) {
    console.error('Error in getBudgetDetails:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET monthly summary: /budgets/monthly/:month
export const getMonthlySummary = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { month } = req.params;
    if (!month || typeof month !== 'string')
      return res.status(400).json({ message: 'month param required' });

    const summary = await buildMonthlySummary(userId, month);

    // Format response according to spec
    const categories = (summary.categories || []).map(c => ({
      category: c.category,
      amount: Number(c.amount),
      percentageUsed: Number(
        ((c.amount ?? 0) / (summary.totalBudget || 1)) * 100
      ),
    }));

    const resp = {
      month: summary.month,
      // totalBudget: Number(summary.totalBudget || 0),
      totalExpense: Number(summary.totalExpense || 0),
      totalPercentageUsed: Number(summary.totalPercentageUsed || 0),
      categories,
    };

    return res.json({ success: true, data: resp });
  } catch (error) {
    console.error('Error in getMonthlySummary:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getSimpleBudgetDetails = async (req: Request, res: Response) => {
  try {
    // Extract userId from JWT payload (req.user should be set by authentication middleware)
    const userId = (req.user as { id: string })?.id;
    // Extract month from query parameters (from URL like ?Month=2025-09)
    const month = req.query.Month as string;
    // const { month } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'User not authenticated' });
    }

    if (!month) {
      return res
        .status(400)
        .json({ success: false, message: 'Month parameter is required' });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);

    const budgetResult = await Budget.aggregate([
      {
        $match: { userId: userIdObj, month },
      },
      {
        $project: {
          _id: 0,
          month: 1,
          amount: {
            $cond: [
              { $gt: ['$totalBudget', 0] },
              '$totalBudget',
              '$totalCategoryAmount',
            ],
          },
        },
      },
    ]);

    if (!budgetResult || budgetResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found for the specified month',
      });
    }

    // Simplify the response to only include month and amount
    const simpleData = {
      month: budgetResult[0].month,
      amount: budgetResult[0].amount,
    };

    return res.json({ success: true, data: simpleData });
  } catch (error) {
    console.error('Error in getSimpleBudgetDetails:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const postSimpleBudgetDetails = async (req: Request, res: Response) => {
  try {
    // Extract userId from JWT payload (req.user should be set by authentication middleware)
    const userId = (req.user as { id: string })?.id;
    // Extract month and amount from request body
    const { month, amount } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'User not authenticated' });
    }

    if (!month || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Month and amount parameters are required',
      });
    }

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
      });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);

    // Find and update the budget, or create if it doesn't exist
    const budget = await Budget.findOneAndUpdate(
      { userId: userIdObj, month },
      {
        $set: {
          totalBudget: amount,
          month,
          userId: userIdObj,
        },
      },
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return the updated document
        runValidators: true,
      }
    );

    return res.json({
      success: true,
      message: 'Budget saved successfully',
      data: {
        month: budget.month,
        amount: budget.totalBudget,
      },
    });
  } catch (error: any) {
    console.error('Error in postSimpleBudgetDetails:', error);

    // Handle duplicate key errors or validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }

    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this month',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
