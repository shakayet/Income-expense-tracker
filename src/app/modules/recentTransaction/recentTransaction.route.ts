import express from 'express';
import { recentTransactions } from './recentTransaction.controller';

const router = express.Router();

router.route('/').get(recentTransactions);

export const recentTransaction = router;
