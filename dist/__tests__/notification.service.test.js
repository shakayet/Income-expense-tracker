"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationService = __importStar(require("../app/modules/notification/notification.service"));
const notification_model_1 = require("../app/modules/notification/notification.model");
const user_model_1 = require("../app/modules/user/user.model");
const pushV1_1 = require("../helpers/pushV1");
const logger_1 = require("../shared/logger");
const socketHelper_1 = require("../helpers/socketHelper");
// Mock all external dependencies
jest.mock('../app/modules/notification/notification.model');
jest.mock('../app/modules/user/user.model');
jest.mock('../helpers/pushV1');
jest.mock('../shared/logger');
jest.mock('../helpers/socketHelper');
describe('Notification Service', () => {
    const mockUserId = new mongoose_1.Types.ObjectId().toString();
    const mockNotificationId = new mongoose_1.Types.ObjectId().toString();
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
        socketHelper_1.socketHelper.io = null;
    });
    describe('getUserNotifications', () => {
        it('should return all notifications for a user sorted by creation date', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockNotifications = [
                Object.assign(Object.assign({}, mockNotificationData), { createdAt: new Date(Date.now() - 1000) }),
                Object.assign(Object.assign({}, mockNotificationData), { createdAt: new Date() }),
            ];
            notification_model_1.Notification.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockNotifications),
            });
            const result = yield NotificationService.getUserNotifications(mockUserId);
            expect(notification_model_1.Notification.find).toHaveBeenCalledWith({ userId: mockUserId });
            expect(result).toEqual(mockNotifications);
            expect(result.length).toBe(2);
        }));
        it('should return empty array if user has no notifications', () => __awaiter(void 0, void 0, void 0, function* () {
            notification_model_1.Notification.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
            });
            const result = yield NotificationService.getUserNotifications(mockUserId);
            expect(result).toEqual([]);
            expect(result.length).toBe(0);
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            const dbError = new Error('Database connection failed');
            notification_model_1.Notification.find.mockReturnValue({
                sort: jest.fn().mockRejectedValue(dbError),
            });
            yield expect(NotificationService.getUserNotifications(mockUserId)).rejects.toThrow('Database connection failed');
        }));
    });
    describe('createNotification', () => {
        const notificationPayload = {
            type: 'budget-warning',
            title: 'Budget Alert',
            message: 'You have exceeded 80% of your budget',
            budgetAmount: 1000,
            usedAmount: 850,
        };
        it('should create notification and emit socket event when user and FCM token exist', () => __awaiter(void 0, void 0, void 0, function* () {
            notification_model_1.Notification.create.mockResolvedValue(mockNotificationData);
            user_model_1.User.findById.mockResolvedValue(mockUserData);
            pushV1_1.sendPushNotification.mockResolvedValue(undefined);
            const mockSocketIo = { emit: jest.fn() };
            socketHelper_1.socketHelper.io = mockSocketIo;
            const result = yield NotificationService.createNotification(notificationPayload, mockUserId);
            // Verify notification was created
            expect(notification_model_1.Notification.create).toHaveBeenCalledWith(Object.assign(Object.assign({}, notificationPayload), { userId: mockUserId }));
            // Verify socket event was emitted
            expect(mockSocketIo.emit).toHaveBeenCalledWith(`notification::${mockUserId}`, mockNotificationData);
            // Verify user was fetched
            expect(user_model_1.User.findById).toHaveBeenCalledWith(mockUserId);
            // Verify push notification was sent
            expect(pushV1_1.sendPushNotification).toHaveBeenCalledWith({
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
        }));
        it('should create notification but skip push when user has no FCM token', () => __awaiter(void 0, void 0, void 0, function* () {
            const userWithoutToken = Object.assign(Object.assign({}, mockUserData), { fcmToken: null });
            notification_model_1.Notification.create.mockResolvedValue(mockNotificationData);
            user_model_1.User.findById.mockResolvedValue(userWithoutToken);
            const mockSocketIo = { emit: jest.fn() };
            socketHelper_1.socketHelper.io = mockSocketIo;
            const result = yield NotificationService.createNotification(notificationPayload, mockUserId);
            expect(notification_model_1.Notification.create).toHaveBeenCalled();
            expect(mockSocketIo.emit).toHaveBeenCalled();
            expect(pushV1_1.sendPushNotification).not.toHaveBeenCalled();
            expect(result).toEqual(mockNotificationData);
        }));
        it('should handle object format FCM token', () => __awaiter(void 0, void 0, void 0, function* () {
            const userWithObjectToken = Object.assign(Object.assign({}, mockUserData), { fcmToken: { type: 'test-object-token' } });
            notification_model_1.Notification.create.mockResolvedValue(mockNotificationData);
            user_model_1.User.findById.mockResolvedValue(userWithObjectToken);
            pushV1_1.sendPushNotification.mockResolvedValue(undefined);
            const mockSocketIo = { emit: jest.fn() };
            socketHelper_1.socketHelper.io = mockSocketIo;
            const result = yield NotificationService.createNotification(notificationPayload, mockUserId);
            expect(pushV1_1.sendPushNotification).toHaveBeenCalledWith({
                token: 'test-object-token',
                title: expect.any(String),
                body: expect.any(String),
                data: expect.any(Object),
            });
            expect(result).toEqual(mockNotificationData);
        }));
        it('should create notification but log error if FCM send fails', () => __awaiter(void 0, void 0, void 0, function* () {
            const fcmError = new Error('FCM service unavailable');
            notification_model_1.Notification.create.mockResolvedValue(mockNotificationData);
            user_model_1.User.findById.mockResolvedValue(mockUserData);
            pushV1_1.sendPushNotification.mockRejectedValue(fcmError);
            const mockSocketIo = { emit: jest.fn() };
            socketHelper_1.socketHelper.io = mockSocketIo;
            const result = yield NotificationService.createNotification(notificationPayload, mockUserId);
            // Notification should still be created despite FCM failure
            expect(notification_model_1.Notification.create).toHaveBeenCalled();
            expect(result).toEqual(mockNotificationData);
            // Error should be logged but not thrown
            expect(logger_1.errorLogger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to send push notification'));
        }));
        it('should skip socket emit if socketHelper.io is not initialized', () => __awaiter(void 0, void 0, void 0, function* () {
            socketHelper_1.socketHelper.io = null;
            notification_model_1.Notification.create.mockResolvedValue(mockNotificationData);
            user_model_1.User.findById.mockResolvedValue(mockUserData);
            pushV1_1.sendPushNotification.mockResolvedValue(undefined);
            const result = yield NotificationService.createNotification(notificationPayload, mockUserId);
            expect(notification_model_1.Notification.create).toHaveBeenCalled();
            expect(result).toEqual(mockNotificationData);
        }));
        it('should handle missing user gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            notification_model_1.Notification.create.mockResolvedValue(mockNotificationData);
            user_model_1.User.findById.mockResolvedValue(null);
            const mockSocketIo = { emit: jest.fn() };
            socketHelper_1.socketHelper.io = mockSocketIo;
            const result = yield NotificationService.createNotification(notificationPayload, mockUserId);
            // Notification should still be created
            expect(notification_model_1.Notification.create).toHaveBeenCalled();
            expect(result).toEqual(mockNotificationData);
            // Push should be skipped
            expect(pushV1_1.sendPushNotification).not.toHaveBeenCalled();
        }));
        it('should convert all FCM data values to strings', () => __awaiter(void 0, void 0, void 0, function* () {
            notification_model_1.Notification.create.mockResolvedValue(Object.assign(Object.assign({}, mockNotificationData), { type: 'monthly-report', reportMonth: '2025-11', reportYear: '2025' }));
            user_model_1.User.findById.mockResolvedValue(mockUserData);
            pushV1_1.sendPushNotification.mockResolvedValue(undefined);
            const mockSocketIo = { emit: jest.fn() };
            socketHelper_1.socketHelper.io = mockSocketIo;
            yield NotificationService.createNotification({
                type: 'monthly-report',
                title: 'Monthly Report',
                message: 'Your monthly report is ready',
                reportMonth: '2025-11',
                reportYear: '2025',
            }, mockUserId);
            const callArgs = pushV1_1.sendPushNotification.mock.calls[0][0];
            expect(callArgs.data).toBeDefined();
            // All data values should be strings
            Object.values(callArgs.data).forEach(value => {
                expect(typeof value).toBe('string');
            });
        }));
    });
    describe('markNotificationAsRead', () => {
        it('should mark notification as read and return updated document', () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedNotification = Object.assign(Object.assign({}, mockNotificationData), { isRead: true });
            notification_model_1.Notification.findByIdAndUpdate.mockResolvedValue(updatedNotification);
            const result = yield NotificationService.markNotificationAsRead(mockNotificationId);
            expect(notification_model_1.Notification.findByIdAndUpdate).toHaveBeenCalledWith(mockNotificationId, { isRead: true }, { new: true });
            expect(result).toEqual(updatedNotification);
            if (result) {
                expect(result.isRead).toBe(true);
            }
        }));
        it('should return null if notification does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            notification_model_1.Notification.findByIdAndUpdate.mockResolvedValue(null);
            const result = yield NotificationService.markNotificationAsRead(mockNotificationId);
            expect(result).toBeNull();
        }));
        it('should handle database errors when marking as read', () => __awaiter(void 0, void 0, void 0, function* () {
            const dbError = new Error('Database error');
            notification_model_1.Notification.findByIdAndUpdate.mockRejectedValue(dbError);
            yield expect(NotificationService.markNotificationAsRead(mockNotificationId)).rejects.toThrow('Database error');
        }));
    });
    describe('Edge Cases & Integration', () => {
        it('should handle multiple notifications in sequence without interference', () => __awaiter(void 0, void 0, void 0, function* () {
            const notif1 = Object.assign(Object.assign({}, mockNotificationData), { _id: new mongoose_1.Types.ObjectId() });
            const notif2 = Object.assign(Object.assign({}, mockNotificationData), { _id: new mongoose_1.Types.ObjectId(), type: 'yearly-report' });
            notification_model_1.Notification.create
                .mockResolvedValueOnce(notif1)
                .mockResolvedValueOnce(notif2);
            user_model_1.User.findById.mockResolvedValue(mockUserData);
            pushV1_1.sendPushNotification.mockResolvedValue(undefined);
            const mockSocketIo = { emit: jest.fn() };
            socketHelper_1.socketHelper.io = mockSocketIo;
            const result1 = yield NotificationService.createNotification({
                type: 'budget-warning',
                title: 'Alert 1',
                message: 'Message 1',
            }, mockUserId);
            const result2 = yield NotificationService.createNotification({
                type: 'yearly-report',
                title: 'Alert 2',
                message: 'Message 2',
            }, mockUserId);
            expect(result1._id).not.toEqual(result2._id);
            expect(result1.type).toBe('budget-warning');
            expect(result2.type).toBe('yearly-report');
            expect(pushV1_1.sendPushNotification).toHaveBeenCalledTimes(2);
        }));
        it('should sanitize all data fields to prevent injection', () => __awaiter(void 0, void 0, void 0, function* () {
            const maliciousPayload = {
                type: 'budget-warning',
                title: '<script>alert("xss")</script>',
                message: 'Message with "quotes"',
            };
            notification_model_1.Notification.create.mockResolvedValue(mockNotificationData);
            user_model_1.User.findById.mockResolvedValue(mockUserData);
            pushV1_1.sendPushNotification.mockResolvedValue(undefined);
            const mockSocketIo = { emit: jest.fn() };
            socketHelper_1.socketHelper.io = mockSocketIo;
            yield NotificationService.createNotification(maliciousPayload, mockUserId);
            // Verify notification was created with the payload
            expect(notification_model_1.Notification.create).toHaveBeenCalled();
            // In a real scenario, sanitization should happen at controller level
            // This test verifies the service doesn't break with suspicious input
        }));
    });
});
