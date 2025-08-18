import { Request, Response } from 'express';
import { getMonthlyReport, getYearlyReport } from './report.service';

export const monthlyReportController = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Month is required in format YYYY-MM',
        });
    }
    const report = await getMonthlyReport(userId, month);
    res.json({ success: true, data: report });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to get monthly report', error });
  }
};

export const yearlyReportController = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { year } = req.query;
    if (!year || typeof year !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Year is required in format YYYY' });
    }
    const report = await getYearlyReport(userId, year);
    res.json({ success: true, data: report });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to get yearly report', error });
  }
};
