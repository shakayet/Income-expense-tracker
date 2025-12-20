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
    if (!category || typeof category !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'category is required and must be a string',
      });
    }
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

    const budget = await addOrIncrementCategory(
      userId,
      month,
      category,
      amount
    );

    // Trigger notifications check (reuse existing notifier)
    try {
      await notifyOnBudgetThreshold(userId, month);
    } catch (e) {
      console.warn('notifyOnBudgetThreshold failed', e);
    }

    return res
      .status(200)
      .json({ success: true, message: 'Budget posted', data: budget });
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
    const { month, categories } = req.body;
    if (!month || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Month and categories array are required',
      });
    }
    // Ensure categoryId is a string and keep as string
    const parsedCategories = categories.map(cat => {
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
    let budget = await Budget.findOne({ userId, month });
    if (budget) {
      budget.categories = parsedCategories;
      await budget.save();
    } else {
      budget = await Budget.create({
        userId,
        month,
        categories: parsedCategories,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Budget categories set successfully',
      data: budget,
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

    const { month, categoryId } = req.params;
    const { amount } = req.body;

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not found for this month' });
    }

    const categoryIndex = budget.categories?.findIndex(
      cat => cat.categoryId === categoryId
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
      message: `Budget category '${categoryId}' updated successfully`,
      data: {
        month: budget.month,
        totalBudget: budget.totalBudget,
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

    const { month, categoryId } = req.params;

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: 'Budget not found for this month' });
    }

    const initialLength = budget.categories?.length;
    budget.categories = budget.categories?.filter(
      cat => cat.categoryId !== categoryId
    );

    if (!budget.categories || budget.categories.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found in budget' });
    }

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

// Get budget details, including expense tracking
// export const getBudgetDetails = async (req: Request, res: Response) => {
//   try {
//     const userId = (req.user as { id?: string } | undefined)?.id;
//     if (!userId) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const month = req.params.month;

//     const budget = await getBudgetByUserAndMonth(userId, month);

//     if (!budget) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Budget not set for this month' });
//     }

//     // Calculate total expenses for the month grouped by category
//     const expensesAgg = await Expense.aggregate([
//       {
//         $match: {
//           userId: new mongoose.Types.ObjectId(userId),
//           createdAt: {
//             $gte: new Date(`${month}-01T00:00:00Z`),
//             $lt: new Date(
//               new Date(`${month}-01T00:00:00Z`).setMonth(
//                 new Date(`${month}-01T00:00:00Z`).getMonth() + 1
//               )
//             ),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: '$category',
//           totalExpense: { $sum: '$amount' },
//         },
//       },
//     ]);

//     // Convert _id (category ObjectId) to string for keys in map
//     const expenseMap = new Map(
//       expensesAgg.map(exp => [exp._id?.toString(), exp.totalExpense])
//     );

//     const totalExpense = expensesAgg.reduce(
//       (sum, exp) => sum + exp.totalExpense,
//       0
//     );

//     console.log('Expense Map keys:', [...expenseMap.keys()]);

//     const effectiveTotalBudget = budget.totalBudget ?? budget.totalCategoryAmount;
//     const totalRemaining = (effectiveTotalBudget ?? 0) - totalExpense;
//     const totalPercentageUsed =
//       effectiveTotalBudget && effectiveTotalBudget > 0
//         ? (totalExpense / effectiveTotalBudget) * 100
//         : 0;

//     // Normalize all categoryIds to strings for matching
//     const categories = (budget.categories ?? []).map(cat => ({
//       ...cat,
//       categoryId: cat.categoryId?.toString(),
//     }));

//     console.log('Budget categories:', categories.map(c => c.categoryId));

//     const categoryDetails = categories.map(budgetCategory => {
//       const amount =
//         typeof budgetCategory.amount === 'number' ? budgetCategory.amount : 0;
//       const spent = expenseMap.get(budgetCategory.categoryId) ?? 0;
//       const remaining = amount - spent;
//       const percentageUsed = amount > 0 ? (spent / amount) * 100 : 0;
//       const percentageOfTotalBudget =
//         effectiveTotalBudget && effectiveTotalBudget > 0
//           ? (amount / effectiveTotalBudget) * 100
//           : 0;

//       return {
//         categoryId: budgetCategory.categoryId,
//         budgetAmount: amount.toFixed(2),
//         spent: spent.toFixed(2),
//         remaining: remaining.toFixed(2),
//         percentageUsed: percentageUsed.toFixed(2),
//         percentageOfTotalBudget: percentageOfTotalBudget.toFixed(2),
//         status:
//           percentageUsed >= 100
//             ? 'exceeded'
//             : percentageUsed >= 80
//             ? 'warning'
//             : 'good',
//       };
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         month,
//         totalBudget: budget.totalBudget?.toFixed(2) ?? null,
//         totalCategoryAmount: budget.totalCategoryAmount?.toFixed(2) ?? null,
//         effectiveTotalBudget: effectiveTotalBudget?.toFixed(2) ?? '0.00',
//         totalExpense: totalExpense.toFixed(2),
//         totalRemaining: totalRemaining.toFixed(2),
//         totalPercentageUsed: totalPercentageUsed.toFixed(2),
//         totalPercentageLeft: (100 - totalPercentageUsed).toFixed(2),
//         categories: categoryDetails,
//         summary: {
//           totalCategories: categories.length,
//           categoriesExceeded: categoryDetails.filter(cat => cat.status === 'exceeded').length,
//           categoriesInWarning: categoryDetails.filter(cat => cat.status === 'warning').length,
//           categoriesGood: categoryDetails.filter(cat => cat.status === 'good').length,
//           budgetType: budget.totalBudget ? 'monthly_budget_set' : 'category_budgets_only',
//         },
//       },
//     });
//   } catch (error) {
//     console.error('Error getting budget details:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Failed to get budget details', error });
//   }
// };

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
                _id: '$category',
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
                                  { $toString: '$$this._id' },
                                  '$$cat.categoryId',
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
          // effectiveTotalBudget: {
          //   $cond: [
          //     { $gt: ['$totalBudget', 0] },
          //     '$totalBudget',
          //     '$totalCategoryAmount',
          //   ],
          // },
        },
      },
      // Projection
      {
        $project: {
          _id: 0,
          month: 1,
          // totalIncome: { $toString: '$totalIncome' }, // 🔹 new field
          totalBudget: { $toString: { $round: ['$totalBudget', 2] } },
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
                    { $gt: ['$totalBudget', 0] },
                    {
                      $multiply: [
                        { $divide: ['$totalExpense', '$totalBudget'] },
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
      totalBudget: Number(summary.totalBudget || 0),
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
