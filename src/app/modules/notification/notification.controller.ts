import { Request, Response } from 'express';
import * as NotificationService from './notification.service';
import { Notification } from './notification.model';
import AppError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';

export const getNotifications = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = req.user.id;
  const notifications = await NotificationService.getUserNotifications(userId);
  res.json({ success: true, data: notifications });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await NotificationService.markNotificationAsRead(id);
  res.json({ success: true, data: updated });
};

// only for creating notifications (temporary)

// export const postNotifications = async (req: Request, res: Response) => {
//   if (!req.user || !req.user.id) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }
//   const userId = req.user.id;
//   // const payLoad = req.body;

//   const notifications = await NotificationService.createNotification(
//     userId
//   );
//   res.json({ success: true, data: notifications });
// };

export const getSingleNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);
  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification fetched successfully',
    data: notification,
  });
};
