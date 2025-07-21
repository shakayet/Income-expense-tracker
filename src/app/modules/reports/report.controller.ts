import { Request, Response } from 'express';
import { getMonthlyReport, getYearlyReport } from './report.service';

export const monthlyReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { month } = req.query;

    if (!userId || !month)
      return res
        .status(400)
        .json({ success: false, message: 'userId or month missing' });

    const report = await getMonthlyReport(userId, month as string);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Monthly report failed', error });
  }
};

export const yearlyReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { year } = req.query;

    if (!userId || !year)
      return res
        .status(400)
        .json({ success: false, message: 'userId or year missing' });

    const report = await getYearlyReport(userId, year as string);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Yearly report failed', error });
  }
};
