import { Request, Response } from 'express';
import fs from 'fs';
import { extractDataFromImage } from './expense.ocr.service';
import * as expenseService from './expense.service';
import { Types } from 'mongoose';

export const uploadReceipt = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const file = files?.['image']?.[0];
    if (!file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const { amount, category } = await extractDataFromImage(file.path);

    if (!amount || !category) {
      return res.status(400).json({ message: 'Failed to extract data from image' });
    }

    const userId = new Types.ObjectId(req.user.id);
    const expense = await expenseService.createExpense(userId, {
      amount,
      category,
      note: 'Added via OCR'
    });

    // Optionally delete the image after processing
    fs.unlinkSync(file.path);

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
