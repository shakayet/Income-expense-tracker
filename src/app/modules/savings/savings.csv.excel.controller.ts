import { Request, Response } from 'express';
import { SavingsService } from './savings.service';
import { generateSavingsCSV, generateSavingsExcel } from './savings.csv.excel';

export const savingsCSVController = async (req: Request, res: Response) => {
  try {
    // Ensure user ID exists
    const userId: string | undefined = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch savings summary
    const reportData = await SavingsService.getSavingsSummaryByCategory(userId);

    if (!reportData || reportData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No savings data found',
      });
    }

    const name: string | undefined = req.user?.name;
    const email: string | undefined = req.user?.email;

    // Generate CSV
    const csvContent = await generateSavingsCSV(reportData);

    // Set headers so browser downloads the CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="savings-report.csv"'
    );

    // Send CSV
    return res.send(csvContent);
  } catch (error) {
    console.error('CSV Error:', error);

    return res.status(500).json({
      success: false,
      error: 'CSV generation failed',
    });
  }
};

export const savingsExcelController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const reportData = await SavingsService.getSavingsSummaryByCategory(userId);
    if (!reportData || reportData.length === 0)
      return res.status(400).json({ message: 'No savings data found' });

    await generateSavingsExcel(reportData, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Excel generation failed' });
  }
};
