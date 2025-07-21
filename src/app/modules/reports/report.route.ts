import express from 'express';
import { monthlyReport, yearlyReport } from './report.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.use(auth(USER_ROLES.USER));

router.route('/monthly').get(monthlyReport);
router.route('/yearly').get(yearlyReport);

export const ReportRoutes = router;
