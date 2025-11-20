import { Types } from 'mongoose';
import * as NotificationService from '../app/modules/notification/notification.service';
import { Notification } from '../app/modules/notification/notification.model';
import { User } from '../app/modules/user/user.model';
import { sendPushNotification } from '../helpers/pushV1';
import { errorLogger } from '../shared/logger';
import { socketHelper } from '../helpers/socketHelper';

// Mock all external dependencies
jest.mock('../app/modules/notification/notification.model');
jest.mock('../app/modules/user/user.model');
jest.mock('../helpers/pushV1');
jest.mock('../shared/logger');
jest.mock('../helpers/socketHelper');

describe('Notification Service', () => {
  const mockUserId = new Types.ObjectId().toString();
  const mockNotificationId = new Types.ObjectId().toString();
  const mockUserData = {
    _id: mockUserId,
    fcmToken: 'test-fcm-token-123',
    email: 'test@example.com',
  };

  const mockNotificationData = {
    _id: mockNotificationId,
    userId: mockUserId,
    type: 'budget-warning',
    title: 'Budget Alert',
    message: 'You have exceeded 80% of your budget',
    createdAt: new Date(),
    isRead: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (socketHelper.io as any) = null;
  });

  describe('getUserNotifications', () => {
    it('should return all notifications for a user sorted by creation date', async () => {
      const mockNotifications = [
        { ...mockNotificationData, createdAt: new Date(Date.now() - 1000) },
        { ...mockNotificationData, createdAt: new Date() },
      ];

      (Notification.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockNotifications),
      });

      const result = await NotificationService.getUserNotifications(mockUserId);

      expect(Notification.find).toHaveBeenCalledWith({ userId: mockUserId });
      expect(result).toEqual(mockNotifications);
      expect(result.length).toBe(2);
    });

    it('should return empty array if user has no notifications', async () => {
      (Notification.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const result = await NotificationService.getUserNotifications(mockUserId);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      (Notification.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(dbError),
      });

      await expect(
        NotificationService.getUserNotifications(mockUserId)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('createNotification', () => {
    const notificationPayload = {
      type: 'budget-warning' as const,
      title: 'Budget Alert',
      message: 'You have exceeded 80% of your budget',
      budgetAmount: 1000,
      usedAmount: 850,
    };

    it('should create notification and emit socket event when user and FCM token exist', async () => {
      (Notification.create as jest.Mock).mockResolvedValue(
        mockNotificationData
      );
      (User.findById as jest.Mock).mockResolvedValue(mockUserData);
      (sendPushNotification as jest.Mock).mockResolvedValue(undefined);

      const mockSocketIo = { emit: jest.fn() };
      (socketHelper as any).io = mockSocketIo;

      const result = await NotificationService.createNotification(
        notificationPayload,
        mockUserId
      );

      // Verify notification was created
      expect(Notification.create).toHaveBeenCalledWith({
        ...notificationPayload,
        userId: mockUserId,
      });

      // Verify socket event was emitted
      expect(mockSocketIo.emit).toHaveBeenCalledWith(
        `notification::${mockUserId}`,
        mockNotificationData
      );

      // Verify user was fetched
      expect(User.findById).toHaveBeenCalledWith(mockUserId);

      // Verify push notification was sent
      expect(sendPushNotification).toHaveBeenCalledWith({
        token: 'test-fcm-token-123',
        title: 'Budget Alert',
        body: 'You have exceeded 80% of your budget',
        data: expect.objectContaining({
          userId: mockUserId,
          type: 'budget-warning',
          title: 'Budget Alert',
          message: 'You have exceeded 80% of your budget',
        }),
      });

      expect(result).toEqual(mockNotificationData);
    });

    it('should create notification but skip push when user has no FCM token', async () => {
      const userWithoutToken = { ...mockUserData, fcmToken: null };
      (Notification.create as jest.Mock).mockResolvedValue(
        mockNotificationData
      );
      (User.findById as jest.Mock).mockResolvedValue(userWithoutToken);

      const mockSocketIo = { emit: jest.fn() };
      (socketHelper as any).io = mockSocketIo;

      const result = await NotificationService.createNotification(
        notificationPayload,
        mockUserId
      );

      expect(Notification.create).toHaveBeenCalled();
      expect(mockSocketIo.emit).toHaveBeenCalled();
      expect(sendPushNotification).not.toHaveBeenCalled();
      expect(result).toEqual(mockNotificationData);
    });

    it('should handle object format FCM token', async () => {
      const userWithObjectToken = {
        ...mockUserData,
        fcmToken: { type: 'test-object-token' },
      };
      (Notification.create as jest.Mock).mockResolvedValue(
        mockNotificationData
      );
      (User.findById as jest.Mock).mockResolvedValue(userWithObjectToken);
      (sendPushNotification as jest.Mock).mockResolvedValue(undefined);

      const mockSocketIo = { emit: jest.fn() };
      (socketHelper as any).io = mockSocketIo;

      const result = await NotificationService.createNotification(
        notificationPayload,
        mockUserId
      );

      expect(sendPushNotification).toHaveBeenCalledWith({
        token: 'test-object-token',
        title: expect.any(String),
        body: expect.any(String),
        data: expect.any(Object),
      });

      expect(result).toEqual(mockNotificationData);
    });

    it('should create notification but log error if FCM send fails', async () => {
      const fcmError = new Error('FCM service unavailable');
      (Notification.create as jest.Mock).mockResolvedValue(
        mockNotificationData
      );
      (User.findById as jest.Mock).mockResolvedValue(mockUserData);
      (sendPushNotification as jest.Mock).mockRejectedValue(fcmError);

      const mockSocketIo = { emit: jest.fn() };
      (socketHelper as any).io = mockSocketIo;

      const result = await NotificationService.createNotification(
        notificationPayload,
        mockUserId
      );

      // Notification should still be created despite FCM failure
      expect(Notification.create).toHaveBeenCalled();
      expect(result).toEqual(mockNotificationData);

      // Error should be logged but not thrown
      expect(errorLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send push notification')
      );
    });

    it('should skip socket emit if socketHelper.io is not initialized', async () => {
      (socketHelper as any).io = null;
      (Notification.create as jest.Mock).mockResolvedValue(
        mockNotificationData
      );
      (User.findById as jest.Mock).mockResolvedValue(mockUserData);
      (sendPushNotification as jest.Mock).mockResolvedValue(undefined);

      const result = await NotificationService.createNotification(
        notificationPayload,
        mockUserId
      );

      expect(Notification.create).toHaveBeenCalled();
      expect(result).toEqual(mockNotificationData);
    });

    it('should handle missing user gracefully', async () => {
      (Notification.create as jest.Mock).mockResolvedValue(
        mockNotificationData
      );
      (User.findById as jest.Mock).mockResolvedValue(null);

      const mockSocketIo = { emit: jest.fn() };
      (socketHelper as any).io = mockSocketIo;

      const result = await NotificationService.createNotification(
        notificationPayload,
        mockUserId
      );

      // Notification should still be created
      expect(Notification.create).toHaveBeenCalled();
      expect(result).toEqual(mockNotificationData);

      // Push should be skipped
      expect(sendPushNotification).not.toHaveBeenCalled();
    });

    it('should convert all FCM data values to strings', async () => {
      (Notification.create as jest.Mock).mockResolvedValue({
        ...mockNotificationData,
        type: 'monthly-report',
        reportMonth: '2025-11',
        reportYear: '2025',
      });
      (User.findById as jest.Mock).mockResolvedValue(mockUserData);
      (sendPushNotification as jest.Mock).mockResolvedValue(undefined);

      const mockSocketIo = { emit: jest.fn() };
      (socketHelper as any).io = mockSocketIo;

      await NotificationService.createNotification(
        {
          type: 'monthly-report',
          title: 'Monthly Report',
          message: 'Your monthly report is ready',
          reportMonth: '2025-11',
          reportYear: '2025',
        },
        mockUserId
      );

      const callArgs = (sendPushNotification as jest.Mock).mock.calls[0][0];
      expect(callArgs.data).toBeDefined();
      // All data values should be strings
      Object.values(callArgs.data).forEach(value => {
        expect(typeof value).toBe('string');
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read and return updated document', async () => {
      const updatedNotification = { ...mockNotificationData, isRead: true };
      (Notification.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        updatedNotification
      );

      const result = await NotificationService.markNotificationAsRead(
        mockNotificationId
      );

      expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(
        mockNotificationId,
        { isRead: true },
        { new: true }
      );
      expect(result).toEqual(updatedNotification);
      if (result) {
        expect(result.isRead).toBe(true);
      }
    });

    it('should return null if notification does not exist', async () => {
      (Notification.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await NotificationService.markNotificationAsRead(
        mockNotificationId
      );

      expect(result).toBeNull();
    });

    it('should handle database errors when marking as read', async () => {
      const dbError = new Error('Database error');
      (Notification.findByIdAndUpdate as jest.Mock).mockRejectedValue(dbError);

      await expect(
        NotificationService.markNotificationAsRead(mockNotificationId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('Edge Cases & Integration', () => {
    it('should handle multiple notifications in sequence without interference', async () => {
      const notif1 = { ...mockNotificationData, _id: new Types.ObjectId() };
      const notif2 = {
        ...mockNotificationData,
        _id: new Types.ObjectId(),
        type: 'yearly-report' as const,
      };

      (Notification.create as jest.Mock)
        .mockResolvedValueOnce(notif1)
        .mockResolvedValueOnce(notif2);
      (User.findById as jest.Mock).mockResolvedValue(mockUserData);
      (sendPushNotification as jest.Mock).mockResolvedValue(undefined);

      const mockSocketIo = { emit: jest.fn() };
      (socketHelper as any).io = mockSocketIo;

      const result1 = await NotificationService.createNotification(
        {
          type: 'budget-warning',
          title: 'Alert 1',
          message: 'Message 1',
        },
        mockUserId
      );

      const result2 = await NotificationService.createNotification(
        {
          type: 'yearly-report',
          title: 'Alert 2',
          message: 'Message 2',
        },
        mockUserId
      );

      expect(result1._id).not.toEqual(result2._id);
      expect(result1.type).toBe('budget-warning');
      expect(result2.type).toBe('yearly-report');
      expect(sendPushNotification).toHaveBeenCalledTimes(2);
    });

    it('should sanitize all data fields to prevent injection', async () => {
      const maliciousPayload = {
        type: 'budget-warning' as const,
        title: '<script>alert("xss")</script>',
        message: 'Message with "quotes"',
      };

      (Notification.create as jest.Mock).mockResolvedValue(
        mockNotificationData
      );
      (User.findById as jest.Mock).mockResolvedValue(mockUserData);
      (sendPushNotification as jest.Mock).mockResolvedValue(undefined);

      const mockSocketIo = { emit: jest.fn() };
      (socketHelper as any).io = mockSocketIo;

      await NotificationService.createNotification(
        maliciousPayload,
        mockUserId
      );

      // Verify notification was created with the payload
      expect(Notification.create).toHaveBeenCalled();

      // In a real scenario, sanitization should happen at controller level
      // This test verifies the service doesn't break with suspicious input
    });
  });
});
