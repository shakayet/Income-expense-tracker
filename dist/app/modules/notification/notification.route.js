"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
// import { sendMonthlyAndYearlyNotifications } from '../../../util/notificationTrigger';
const router = express_1.default.Router();
router.use((0, auth_1.default)(user_1.USER_ROLES.USER));
router.get('/', notification_controller_1.getNotifications);
router.patch('/:id/read', notification_controller_1.markAsRead);
router.post('/', notification_controller_1.postNotifications);
// router.post('/test-monthly-yearly', sendMonthlyAndYearlyNotifications);
router.get('/:id', notification_controller_1.getSingleNotification);
exports.NotificationRoutes = router;
