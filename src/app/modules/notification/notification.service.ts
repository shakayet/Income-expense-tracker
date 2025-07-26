import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { socketHelper } from '../../../helpers/socketHelper'; // socket instance
import { JwtPayload } from 'jsonwebtoken';
import { sendMonthlyAndYearlyNotifications } from '../../../util/notificationTrigger';

// GET ALL NOTIFICATIONS FOR USER
export const getUserNotifications = async (userId: string) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

// CREATE NOTIFICATION
export const createNotification = async (data: any, userId: string) => {


  const payload = {
  userId,
  type: "monthly-report",
  title: "Your Monthly Report is Ready",
  message: `Tap to see your report for ${data.month}`,
  reportMonth: data.month,
  reportYear: "2025"
}

const userIdString = userId.toString();

  
  const created = await Notification.create(payload);
  console.log('Notification created:', created);
  if (socketHelper.io && userIdString) {
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
