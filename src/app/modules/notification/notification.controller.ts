import { Request, Response } from 'express';
import * as NotificationService from './notification.service';

export const getNotifications = async (req: Request, res: Response) => {
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

export const postNotifications = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const payLoad = req.body;
  const notifications = await NotificationService.createNotification(
    payLoad,
    userId
  );
  res.json({ success: true, data: notifications });
};

// ...existing code...
