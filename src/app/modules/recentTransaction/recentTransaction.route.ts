import express from 'express';
import { recentTransactions } from './recentTransaction.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/').get(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), recentTransactions);

export const recentTransaction = router;
