/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { getMonthlyExpenseSummaryForPdf } from './expense.controller';
import { generateExpenseCSV, generateExpenseExcel } from './expense.csv.excel';

export const expenseCSVController = async (req: Request, res: Response) => {
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
    const email: string | undefined = req.user?.email;
    const name: string | undefined = req.user?.name;

    const reportData = await getMonthlyExpenseSummaryForPdf(
      userId,
      monthString
    );

    if (!reportData || !reportData.data) {
      return res.status(400).json({
        success: false,
        message: 'No expense data provided',
      });
    }
    console.log(reportData);
    // Generate and stream PDF to client
    await generateExpenseCSV(reportData, res);
  } catch (error) {
    console.error('PDF Error:', error);
    return res.status(500).json({
      success: false,
      error: 'PDF generation failed',
    });
  }
};

//expense excel file ...

export const expenseExcelController = async (req: Request, res: Response) => {
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
    const email: string | undefined = req.user?.email;
    const name: string | undefined = req.user?.name;

    const reportData = await getMonthlyExpenseSummaryForPdf(
      userId,
      monthString
    );

    if (!reportData || !reportData.data) {
      return res.status(400).json({
        success: false,
        message: 'No expense data provided',
      });
    }
    console.log(reportData);
    // Generate and stream PDF to client
    await generateExpenseExcel(reportData.data, res);
  } catch (error) {
    console.error('PDF Error:', error);
    return res.status(500).json({
      success: false,
      error: 'PDF generation failed',
    });
  }
};
