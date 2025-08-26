import { Request, Response } from 'express';
import { getRecentTransactions } from './recentTransaction.service';

export const recentTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const data = await getRecentTransactions(
      userId,
      Number(page),
      Number(limit)
    );

    res.json({
      success: true,
      message: 'Recent transactions fetched successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An error occurred';
    res.status(500).json({
      success: false,
      message,
    });
  }
};
