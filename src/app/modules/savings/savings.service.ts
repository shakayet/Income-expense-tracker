import { Savings } from './savings.model';
import { ISavings } from './savings.interface';

const createSavings = async (data: ISavings) => {
  const savingsValue = data.initialPrice - data.actualPrice;
  const newSavings = await Savings.create({
    ...data,
    savings: savingsValue,
  });
  return newSavings;
};

const getAllSavings = async (userId: string) => {
  return Savings.find({ userId }).sort({ createdAt: -1 });
};

const getSavingsSummaryByCategory = async (userId: string) => {
  const summary = await Savings.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$category',
        totalSavings: { $sum: '$savings' },
      },
    },
    { $sort: { totalSavings: -1 } },
  ]);
  return summary.map(item => ({
    category: item._id,
    totalSavings: item.totalSavings,
  }));
};

export const SavingsService = {
  createSavings,
  getAllSavings,
  getSavingsSummaryByCategory,
};
