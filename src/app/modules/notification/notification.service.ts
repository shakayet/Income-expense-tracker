import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { socketHelper } from '../../../helpers/socketHelper'; // socket instance
import { JwtPayload } from 'jsonwebtoken';
import { sendMonthlyAndYearlyNotifications } from '../../../util/notificationTrigger';
import { checkAndNotifyBudgetUsage } from '../budget/budget.controller';
// import { sendPushNotification } from '../helpers/push';
import { sendPushNotification } from '../../../helpers/push';

// GET ALL NOTIFICATIONS FOR USER
export const getUserNotifications = async (userId: string) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

// CREATE NOTIFICATION
export const createNotification = async (data: any, userId: string) => {
  const userIdString = userId.toString();
  const created = await Notification.create({ ...data, userId: userIdString });
  console.log('notification created:', created);

  if (socketHelper.io && userIdString) {
    socketHelper.io.emit(`notification::${userIdString}`, created);
  }

  // Fetch user to get fcmToken
  const { User } = require('../user/user.model');
  const user = await User.findById(userIdString);
  if (user && user.fcmToken) {
    await sendPushNotification({
      token: user.fcmToken,
      title: created.title,
      body: created.message,
    });
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
