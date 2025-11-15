/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Income, IncomeCategory } from './income.model';
import mongoose from 'mongoose';

const getUserIdFromReq = (req: Request): string | null => {
  // supports different shapes where middleware may attach user info
  const user = (req as any).user;
  if (!user) return null;
  return user.id || user._id || null;
};

export const createIncome = async (req: Request, res: Response) => {
  try {
    const { source, amount, month } = req.body;
    const userId = getUserIdFromReq(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!source || typeof amount === 'undefined') {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Missing required fields: source and amount',
        });
    }

    const now = new Date();

    const income = await Income.create({
      source,
      amount: Number(amount),
      date: now,
      month:
        month ||
        `${now.getFullYear()}-${(now.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`,
      userId,
    });

    res.status(201).json({ success: true, data: income });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to create income', error });
  }
};

export const updateIncome = async (req: Request, res: Response) => {
  try {
    const incomeId = req.params.id;
    const userId = getUserIdFromReq(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(incomeId))
      return res
        .status(400)
        .json({ success: false, message: 'Invalid income id' });

    const updated = await Income.findOneAndUpdate(
      { _id: incomeId, userId },
      { ...req.body },
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: 'Income not found or unauthorized' });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to update income', error });
  }
};

export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const incomeId = req.params.id;
    const userId = getUserIdFromReq(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(incomeId))
      return res
        .status(400)
        .json({ success: false, message: 'Invalid income id' });

    const deleted = await Income.findOneAndDelete({ _id: incomeId, userId });
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: 'Income not found or unauthorized' });

    res
      .status(200)
      .json({ success: true, message: 'Income deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete income', error });
  }
};

export const getAllIncomes = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const { month, page = '1', limit = '10' } = req.query;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Build filter object
    const filter: any = { userId };
    // Add month filter if provided (sanitize)
    if (month && typeof month === 'string') {
      filter.month = month;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt((page as string) || '1'));
    const limitNum = Math.max(
      1,
      Math.min(100, parseInt((limit as string) || '10'))
    );
    const skip = (pageNum - 1) * limitNum;

    // Get incomes with pagination
    const incomes = await Income.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination info
    const total = await Income.countDocuments(filter);

    res
      .status(200)
      .json({
        success: true,
        data: incomes,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch incomes', error });
  }
};

export const getMonthlyIncomeSummary = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    let { month } = req.query;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Auto-detect current month if not provided
    if (!month || typeof month !== 'string') {
      const now = new Date();
      const year = now.getFullYear();
      const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
      month = `${year}-${monthNum}`;
    }

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const summary = await Income.aggregate([
      { $match: { userId: userObjectId, month } },
      { $group: { _id: '$source', totalAmount: { $sum: '$amount' } } },
    ]);

    const totalIncome = summary.reduce(
      (acc: number, item: any) => acc + (item.totalAmount || 0),
      0
    );

    res
      .status(200)
      .json({
        success: true,
        data: {
          month,
          totalIncome,
          breakdown: summary.map((item: any) => ({
            source: item._id,
            amount: item.totalAmount,
          })),
        },
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly income summary',
      error,
    });
  }
};

export const createIncomeCategory = async (req: Request, res: Response) => {
  try {
    const { name, icon } = req.body;
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    // 🔍 Check if category already exists for this user
    const existing = await IncomeCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // case-insensitive match
      userId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This income category already exists.',
      });
    }

    const category = await IncomeCategory.create({ name, icon, userId });

    return res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create income category',
      error,
    });
  }
};


export const updateIncomeCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const { name, icon } = req.body;
    const userId = getUserIdFromReq(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(categoryId))
      return res.status(400).json({ success: false, message: 'Invalid category id' });

    const updated = await IncomeCategory.findOneAndUpdate(
      { _id: categoryId, userId },
      { name, icon },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: 'Category not found or unauthorized' });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update income category', error });
  }
};

export const getIncomeCategories = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const categories = await IncomeCategory.find({
      $or: [{ userId: null }, { userId }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch income categories', error });
  }
};

// Delete income category
export const deleteIncomeCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const userId = getUserIdFromReq(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(categoryId))
      return res
        .status(400)
        .json({ success: false, message: 'Invalid category id' });

    const deleted = await IncomeCategory.findOneAndDelete({
      _id: categoryId,
      userId,
    });

    if (!deleted)
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized',
      });

    res
      .status(200)
      .json({ success: true, message: 'Income category deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete income category', error });
  }
};

