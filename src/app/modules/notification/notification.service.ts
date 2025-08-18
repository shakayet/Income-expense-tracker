import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { socketHelper } from '../../../helpers/socketHelper'; // socket instance
// import { JwtPayload } from 'jsonwebtoken';
// import { sendMonthlyAndYearlyNotifications } from '../../../util/notificationTrigger';
// import { checkAndNotifyBudgetUsage } from '../budget/budget.controller';
// import { sendPushNotification } from '../helpers/push';
import { sendPushNotification } from '../../../helpers/push';

// GET ALL NOTIFICATIONS FOR USER
export const getUserNotifications = async (userId: string) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

// CREATE NOTIFICATION
import { User } from '../user/user.model';
export const createNotification = async (
  data: Partial<INotification> & { title: string; message: string },
  userId: string
) => {
  const userIdString = userId.toString();
  const created = await Notification.create({ ...data, userId: userIdString });

  if (socketHelper.io && userIdString) {
    socketHelper.io.emit(`notification::${userIdString}`, created);
  }

  // Fetch user to get fcmToken
  const user = await User.findById(userIdString);
  if (user && user.fcmToken) {
    let token: string | undefined;
    if (typeof user.fcmToken === 'string') {
      token = user.fcmToken;
    } else if (
      user.fcmToken &&
      typeof user.fcmToken === 'object' &&
      'type' in user.fcmToken
    ) {
      token = String(user.fcmToken.type);
    }
    if (token) {
      await sendPushNotification({
        token,
        title: created.title,
        body: created.message,
      });
    }
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
