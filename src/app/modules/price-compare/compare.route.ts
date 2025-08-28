import express from 'express';
import {
  addCostCompare,
  comparePriceController,
  getCostCompareHistory,
} from './compare.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = express.Router();
router.use(auth(USER_ROLES.USER));

router.route('/')
    .post(comparePriceController);  // searching for best prices

router.route('/cost-compare')
    .post(addCostCompare)
    .get(getCostCompareHistory);

export default router;
