"use strict";
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
exports.markNotificationAsRead = exports.createNotification = exports.getUserNotifications = void 0;
const notification_model_1 = require("./notification.model");
const socketHelper_1 = require("../../../helpers/socketHelper"); // socket instance
const pushV1_1 = require("../../../helpers/pushV1");
const logger_1 = require("../../../shared/logger");
// GET ALL NOTIFICATIONS FOR USER
const getUserNotifications = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_model_1.Notification.find({ userId }).sort({ createdAt: -1 });
});
exports.getUserNotifications = getUserNotifications;
// CREATE NOTIFICATION
const user_model_1 = require("../user/user.model");
const createNotification = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const userIdString = userId.toString();
    // Create notification in database
    const created = yield notification_model_1.Notification.create(Object.assign(Object.assign({}, data), { userId: userIdString }));
    // Emit socket event to notify connected clients in real-time
    if (socketHelper_1.socketHelper.io && userIdString) {
        socketHelper_1.socketHelper.io.emit(`notification::${userIdString}`, created);
    }
    // Fetch user to check for fcmToken for push notification
    const user = yield user_model_1.User.findById(userIdString);
    // If no FCM token, return early (user not opted in for push)
    if (!(user === null || user === void 0 ? void 0 : user.fcmToken)) {
        return created;
    }
    // Extract FCM token (handle both string and object formats)
    const fcmToken = typeof user.fcmToken === 'string'
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
        const dataPayload = {
            userId: created.userId.toString(),
            type: (_a = created.type) !== null && _a !== void 0 ? _a : '',
            title: (_b = created.title) !== null && _b !== void 0 ? _b : '',
            message: (_c = created.message) !== null && _c !== void 0 ? _c : '',
            reportMonth: (_d = created.reportMonth) !== null && _d !== void 0 ? _d : '',
            reportYear: (_e = created.reportYear) !== null && _e !== void 0 ? _e : '',
            notificationId: created._id.toString(),
        };
        // Send push notification via FCM
        yield (0, pushV1_1.sendPushNotification)({
            token: fcmToken,
            title: created.title,
            body: created.message,
            data: dataPayload,
        });
    }
    catch (error) {
        // Log error but don't fail the notification creation
        logger_1.errorLogger.error(`Failed to send push notification for user ${userIdString}: ${error instanceof Error ? error.message : String(error)}`);
    }
    return created;
});
exports.createNotification = createNotification;
// MARK ONE NOTIFICATION AS READ
const markNotificationAsRead = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_model_1.Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
});
exports.markNotificationAsRead = markNotificationAsRead;
