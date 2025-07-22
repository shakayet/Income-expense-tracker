import express from 'express';
import { getNotifications, markAsRead } from './notification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.use(auth(USER_ROLES.USER));

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export const NotificationRoutes = router;
