import { Request, Response } from 'express';
import * as NotificationService from './notification.service';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import AppError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';

export const getNotifications = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  const userId = req.user.id;
  const notifications = await NotificationService.getUserNotifications(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: notifications,
  });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await NotificationService.markNotificationAsRead(id);
  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: updated,
  });
};

// Create notification (requires title and message)
export const postNotifications = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  const userId = req.user.id;
  const payLoad = req.body as Partial<INotification> & {
    title?: string;
    message?: string;
  };

  // Validation: require title and message when creating a notification
  if (!payLoad || !payLoad.title || !payLoad.message) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Title and message are required'
    );
  }

  // createNotification expects (data, userId)
  const created = await NotificationService.createNotification(
    payLoad as Partial<INotification> & { title: string; message: string },
    userId
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Notification created successfully',
    data: created,
  });
};

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
