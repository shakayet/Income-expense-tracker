import express from 'express';
import { monthlyReportController, yearlyReportController } from './report.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.use(auth(USER_ROLES.USER));

router.route('/monthly').get(monthlyReportController);
router.route('/yearly').get(yearlyReportController);

export const ReportRoutes = router;
