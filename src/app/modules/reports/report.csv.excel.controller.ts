import { Request, Response } from 'express';
import { getMonthlyReport } from './report.service';
import { generateFinanceCSV, generateFinanceExcel } from './report.csv.excel';

export const reportCSVController = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.user?.id;

    if (!userId) {
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

    const reportData = await getMonthlyReport(userId, monthString);
    if (!reportData || !reportData) {
      return res.status(400).json({
        success: false,
        message: 'No expense data provided',
      });
    }
    // Generate and stream PDF to client
    const csvData = generateFinanceCSV(reportData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=finance-report-${reportData.month}.csv`
    );
    res.send(csvData);
  } catch (error) {
    console.error('PDF Error:', error);
    return res.status(500).json({
      success: false,
      error: 'PDF generation failed',
    });
  }
};

export const reportExcelController = async (req: Request, res: Response) => {
  try {
    console.log(req.user);
    const userId: string | undefined = req.user?.id;

    if (!userId) {
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

    const reportData = await getMonthlyReport(userId, monthString);
    if (!reportData || !reportData) {
      return res.status(400).json({
        success: false,
        message: 'No expense data provided',
      });
    }
    // Generate and stream PDF to client
    await generateFinanceExcel(reportData, res);
  } catch (error) {
    console.error('PDF Error:', error);
    return res.status(500).json({
      success: false,
      error: 'PDF generation failed',
    });
  }
};
