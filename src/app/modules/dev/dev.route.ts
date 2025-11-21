import express from 'express';
import { testPush } from './dev.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// Admin-only test endpoint to send a push to an arbitrary token
router.post('/test-push', auth(USER_ROLES.SUPER_ADMIN), testPush);

export default router;
