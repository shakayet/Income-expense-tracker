import { Request, Response } from 'express';
import { Income } from './income.model';

export const createIncome = async (req: Request, res: Response) => {
  try {
    const { source, amount, month } = req.body;
    const userId = (req as any).user?.id; // from decoded token

    console.log({userId, source, amount});


    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const now = new Date();
    // const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

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

export const updateIncome = async (req: Request, res: Response) => {
  try {
    const incomeId = req.params.id;
    const userId = (req as any).user?.id;

    const updated = await Income.findOneAndUpdate(
      { _id: incomeId, userId },
      { ...req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Income not found or unauthorized' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update income', error });
  }
};

export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const incomeId = req.params.id;
    const userId = (req as any).user?.id;

    const deleted = await Income.findOneAndDelete({ _id: incomeId, userId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Income not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete income', error });
  }
};
