import { Request, Response } from 'express';
import * as NotificationService from './notification.service';

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.user._id;
  const notifications = await NotificationService.getUserNotifications(userId);
  res.json({ success: true, data: notifications });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await NotificationService.markNotificationAsRead(id);
  res.json({ success: true, data: updated });
};
