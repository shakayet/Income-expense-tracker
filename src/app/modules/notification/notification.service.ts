import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { socketHelper } from '../../../helpers/socketHelper'; // socket instance

// CREATE NOTIFICATION
export const createNotification = async (data: INotification) => {
  const notification = await Notification.create(data);


  if (socketHelper.io) {
    socketHelper.io.to(data.userId.toString()).emit('notification:new', notification);
  }
  return notification;
};

// GET ALL NOTIFICATIONS FOR USER
export const getUserNotifications = async (userId: string) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

// MARK ONE NOTIFICATION AS READ
export const markNotificationAsRead = async (notificationId: string) => {
  return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
};
