import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { getMonthlyReport } from './report.service';
import { generateReportPDF } from './report.pdf';
export const reportPdfController = async (req: Request, res: Response) => {
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
    const name: string | undefined = req.user?.name;
    const email: string | undefined = req.user?.email;
    console.log(reportData);
    // Generate and stream PDF to client
    return generateReportPDF(reportData, res, name, email);
  } catch (error) {
    console.error('PDF Error:', error);
    return res.status(500).json({
      success: false,
      error: 'PDF generation failed',
    });
  }
};
