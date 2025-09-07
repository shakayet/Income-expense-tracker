import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { socketHelper } from '../../../helpers/socketHelper'; // socket instance
// import { JwtPayload } from 'jsonwebtoken';
// import { sendMonthlyAndYearlyNotifications } from '../../../util/notificationTrigger';
// import { checkAndNotifyBudgetUsage } from '../budget/budget.controller';
// import { sendPushNotification } from '../helpers/push';
import { sendPushNotification } from '../../../helpers/pushV1';

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
  // console.log('Creating notification for userId:', userId, 'with data:', data);
  const userIdString = userId.toString();
  const created = await Notification.create({ ...data, userId: userIdString });

  if (socketHelper.io && userIdString) {
    socketHelper.io.emit(`notification::${userIdString}`, created);
  }

  // Fetch user to get fcmToken
  const user = await User.findById(userIdString);

  // console.log({user})

  if (!user?.fcmToken) {
    // console.log('No FCM token for user:', userIdString);
    return created;
  }

  if (user && user.fcmToken) {
    // console.log('User FCM token found, sending push notification...', userIdString);
    
    // if (typeof user.fcmToken === 'string') {
    //   token = user.fcmToken;
    // } else if (
    //   user.fcmToken &&
    //   typeof user.fcmToken === 'object' &&
    //   'type' in user.fcmToken
    // ) {
    //   token = String(user.fcmToken.type);
    // }
    if (user.fcmToken) {
      // Prepare notification data to send in the push `data` field as strings
      const dataPayload: Record<string, string> = {
        userId: created.userId.toString(),
        type: created.type ?? '',
        title: created.title ?? '',
        message: created.message ?? '',
        reportMonth: created.reportMonth ?? '',
        reportYear: created.reportYear ?? '',
        notificationId: created._id.toString()
      };


      await sendPushNotification({
        token: typeof user.fcmToken === 'string'
          ? user.fcmToken
          : (user.fcmToken && typeof user.fcmToken === 'object' && 'type' in user.fcmToken)
            ? String(user.fcmToken.type)
            : '',
        title: created.title,
        body: created.message, // must be string
        data: dataPayload,
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
