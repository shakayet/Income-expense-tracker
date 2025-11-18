import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { getMonthlyIncomeSummaryForPdf } from './income.controller';
import { generateIncomeCSV, generateIncomeExcel } from './income.csv.excel';
export const incomeCSVController = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let { month } = req.query;

    // Validate & convert month to string
    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Month query parameter is required',
      });
    }

    // Convert to string safely
    if (Array.isArray(month)) {
      month = month[0]; // extract only first element
    }

    if (typeof month !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format',
      });
    }

    const monthString: string = month;
    const userId = new Types.ObjectId(req.user.id);
    const name: string | undefined = req.user.name;
    const email: string | undefined = req.user.email;

    const reportData = await getMonthlyIncomeSummaryForPdf(userId, monthString);
    if (!reportData || !reportData?.data) {
      return res.status(400).json({
        success: false,
        message: 'No Income data provided',
      });
    }

    // Generate and stream PDF to client
    generateIncomeCSV(reportData.data, res);
  } catch (error) {
    console.error('PDF Error:', error);
    return res.status(500).json({
      success: false,
      error: 'CSV generation failed',
    });
  }
};

export const incomeExcelController = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let { month } = req.query;

    // Validate & convert month to string
    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Month query parameter is required',
      });
    }

    // Convert to string safely
    if (Array.isArray(month)) {
      month = month[0]; // extract only first element
    }

    if (typeof month !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format',
      });
    }

    const monthString: string = month;
    const userId = new Types.ObjectId(req.user.id);
    const name: string | undefined = req.user.name;
    const email: string | undefined = req.user.email;

    const reportData = await getMonthlyIncomeSummaryForPdf(userId, monthString);
    if (!reportData || !reportData?.data) {
      return res.status(400).json({
        success: false,
        message: 'No Income data provided',
      });
    }

    // Generate and stream PDF to client
    generateIncomeExcel(reportData.data, res);
  } catch (error) {
    console.error('PDF Error:', error);
    return res.status(500).json({
      success: false,
      error: 'CSV generation failed',
    });
  }
};
