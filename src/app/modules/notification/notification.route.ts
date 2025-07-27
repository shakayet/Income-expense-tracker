import express from 'express';
import { getNotifications, markAsRead, postNotifications } from './notification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { sendMonthlyAndYearlyNotifications } from '../../../util/notificationTrigger';

const router = express.Router();

router.use(auth(USER_ROLES.USER));

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/', postNotifications);
router.post('/test-monthly-yearly', sendMonthlyAndYearlyNotifications);
router.get('/:id', NotificationController.getSingleNotification);


export const NotificationRoutes = router;
