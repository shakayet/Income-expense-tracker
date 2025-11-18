import { Request, Response } from 'express';
import { SavingsService } from './savings.service';
import { generateSavingsPDF } from './savings.pdf';

export const savingsPdfController = async (req: Request, res: Response) => {
  try {
    // Ensure user ID exists and is a string
    const userId: string | undefined = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch savings summary
    const reportData = await SavingsService.getSavingsSummaryByCategory(userId);

    if (!reportData) {
      return res.status(400).json({
        success: false,
        message: 'No savings data found',
      });
    }
    console.log(reportData);
    const name: string | undefined = req.user?.name;
    const email: string | undefined = req.user?.email;

    generateSavingsPDF(reportData, res, name, email);
  } catch (error) {
    console.error('PDF Error:', error);

    return res.status(500).json({
      success: false,
      error: 'PDF generation failed',
    });
  }
};
