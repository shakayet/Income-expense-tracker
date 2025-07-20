import { Request, Response } from 'express';
import { Income } from './income.model';

export const createIncome = async (req: Request, res: Response) => {
  try {
    const { source, amount } = req.body;
    const userId = (req as any).user?.userId; // from decoded token

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const income = await Income.create({
      source,
      amount,
      date: now,
      month,
      userId,
    });

    res.status(201).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create income', error });
  }
};