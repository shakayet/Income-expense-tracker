import { Types } from 'mongoose';
import { createNotification } from './notification.service';

export const notifyIfCategoryThresholdCrossed = async ({
  userId,
  categoryId,
  month,
  totalExpense,
  budgetAmount,
  existingThresholds = [],
}: {
  userId: Types.ObjectId | string;
  categoryId: Types.ObjectId | string;
  month: string;
  totalExpense: number;
  budgetAmount: number;
  existingThresholds?: number[];
}) => {
  const percentage = (totalExpense / budgetAmount) * 100;
  const thresholds = [80, 100];

  for (const t of thresholds) {
    if (percentage >= t && !existingThresholds.includes(t)) {
      await createNotification(
        {
          type: 'category-budget-exceeded',
          title: `Category Budget Alert: ${t}% reached`,
          message: `You've used ${t}% of your category budget for month ${month}. Tap to see details.`,
          reportMonth: month,
          categoryId: String(categoryId),
          detailsLink: `/api/v1/category/details?categoryId=${String(
            categoryId
          )}&month=${month}`,
        },
        String(userId)
      );
      existingThresholds.push(t);
    }
  }

  if (percentage > 100 && !existingThresholds.includes(101)) {
    await createNotification(
      {
        type: 'category-budget-exceeded',
        title: `Category Budget Exceeded!`,
        message: `You've exceeded your category budget for month ${month}. Tap to see details.`,
        reportMonth: month,
        categoryId: String(categoryId),
        detailsLink: `/api/v1/category/details?categoryId=${String(
          categoryId
        )}&month=${month}`,
      },
      String(userId)
    );
    existingThresholds.push(101);
  }
};
