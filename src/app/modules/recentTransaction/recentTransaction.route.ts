import express from 'express';
import { recentTransactions } from './recentTransaction.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/').get(auth(USER_ROLES.USER), recentTransactions);

export const recentTransaction = router;
