import { Types } from 'mongoose';
import { createNotification } from '../notification/notification.service';

export const notifyIfThresholdCrossed = async ({
  userId,
  month,
  totalExpense,
  budgetAmount,
  existingThresholds = [],
}: {
  userId: Types.ObjectId;
  month: string;
  totalExpense: number;
  budgetAmount: number;
  existingThresholds?: number[];
}) => {
  const percentage = (totalExpense / budgetAmount) * 100;
  const thresholds = [50, 75, 90, 100];

  for (const t of thresholds) {
    if (percentage >= t && !existingThresholds.includes(t)) {
      await createNotification(
        {
          type: 'budget-exceeded',
          title: `Budget Alert: ${t}% reached`,
          message: `You've used ${t}% of your monthly budget for ${month}. Tap to see details.`,
          reportMonth: month,
          detailsLink: `/api/v1/budget/details?month=${month}`,
        },
        userId.toString()
      );
      existingThresholds.push(t);
    }
  }

  if (percentage > 100 && !existingThresholds.includes(101)) {
    await createNotification(
      {
        type: 'budget-exceeded',
        title: `Budget Exceeded!`,
        message: `You've exceeded your monthly budget for ${month}. Tap to see details.`,
        reportMonth: month,
        detailsLink: `/api/v1/budget/details?month=${month}`,
      },
      userId.toString()
    );
    existingThresholds.push(101);
  }

  return existingThresholds;
};
