import { Savings } from './savings.model';
import { ISavings } from './savings.interface';
import mongoose from 'mongoose';

const createSavings = async (data: ISavings) => {
  const savingsValue = data.initialPrice - data.actualPrice;
  const newSavings = await Savings.create({
    ...data,
    savings: savingsValue,
  });
  return newSavings;
};

const getAllSavings = async (userId: string) => {
  return Savings.findOne({ userId }).sort({ createdAt: -1 });
};

const getSavingsSummaryByCategory = async (userId: string) => {
  const summary = await Savings.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: '$category',
        totalInitial: { $sum: '$initialPrice' },
        totalActual: { $sum: '$actualPrice' },
        totalSavings: { $sum: '$savings' },
      },
    },
    { $sort: { totalSavings: -1 } },
  ]);

  return summary.map(item => ({
    category: item._id,
    totalInitial: item.totalInitial,
    totalActual: item.totalActual,
    totalSavings: item.totalSavings,
  }));
};


export const SavingsService = {
  createSavings,
  getAllSavings,
  getSavingsSummaryByCategory,
};
