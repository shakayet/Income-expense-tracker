import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { socketHelper } from '../../../helpers/socketHelper'; // socket instance
import { JwtPayload } from 'jsonwebtoken';
import { sendMonthlyAndYearlyNotifications } from '../../../util/notificationTrigger';
import { checkAndNotifyBudgetUsage } from '../budget/budget.controller';

// GET ALL NOTIFICATIONS FOR USER
export const getUserNotifications = async (userId: string) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

// CREATE NOTIFICATION
export const createNotification = async (data: any, userId: string) => {
  
  const userIdString = userId.toString();
  const created = await Notification.create({ ...data, userId: userId.toString() });
  console.log('notification created:', created);

  if (socketHelper.io && userId) {
    socketHelper.io.emit(`notification::${userIdString}`, created);
  }
  return created;
};

// MARK ONE NOTIFICATION AS READ
export const markNotificationAsRead = async (notificationId: string) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};
