import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { socketHelper } from '../../../helpers/socketHelper'; // socket instance
import { sendPushNotification } from '../../../helpers/pushV1';
import { errorLogger } from '../../../shared/logger';

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

  // Create notification in database
  const created = await Notification.create({ ...data, userId: userIdString });

  // Emit socket event to notify connected clients in real-time
  if (socketHelper.io && userIdString) {
    socketHelper.io.emit(`notification::${userIdString}`, created);
  }

  // Fetch user to check for fcmToken for push notification
  const user = await User.findById(userIdString);

  // If no FCM token, return early (user not opted in for push)
  if (!user?.fcmToken) {
    return created;
  }

  // Extract FCM token (handle both string and object formats)
  const fcmToken =
    typeof user.fcmToken === 'string'
      ? user.fcmToken
      : user.fcmToken &&
        typeof user.fcmToken === 'object' &&
        'type' in user.fcmToken
      ? String(user.fcmToken.type)
      : null;

  // If token extraction failed, return early
  if (!fcmToken) {
    return created;
  }

  try {
    // Prepare notification data payload (all values must be strings for FCM)
    const dataPayload: Record<string, string> = {
      userId: created.userId.toString(),
      type: created.type ?? '',
      title: created.title ?? '',
      message: created.message ?? '',
      reportMonth: created.reportMonth ?? '',
      reportYear: created.reportYear ?? '',
      notificationId: created._id.toString(),
    };

    // Send push notification via FCM
    await sendPushNotification({
      token: fcmToken,
      title: created.title,
      body: created.message,
      data: dataPayload,
    });
  } catch (error) {
    // Log error but don't fail the notification creation
    errorLogger.error(
      `Failed to send push notification for user ${userIdString}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
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
