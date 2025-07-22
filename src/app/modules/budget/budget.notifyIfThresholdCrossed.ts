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
  const thresholds = [50, 70, 80, 90, 100];

  for (const t of thresholds) {
    if (percentage >= t && !existingThresholds.includes(t)) {
      await createNotification({
        userId,
        type: 'budget-exceeded',
        title: `Budget Alert: ${t}% reached`,
        message: `You've reached ${t}% of your budget for month ${month}`,
        reportMonth: month,
      });

      existingThresholds.push(t);
    }
  }

  if (percentage > 100 && !existingThresholds.includes(101)) {
    await createNotification({
      userId,
      type: 'budget-exceeded',
      title: `Budget Exceeded!`,
      message: `You have exceeded your budget for ${month}`,
      reportMonth: month,
    });

    existingThresholds.push(101);
  }

  return existingThresholds;
};
