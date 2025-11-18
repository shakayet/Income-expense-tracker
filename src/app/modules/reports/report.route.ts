import express from 'express';
import {
  monthlyReportController,
  yearlyReportController,
} from './report.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { reportPdfController } from './report.pdf.controller';
import {
  reportCSVController,
  reportExcelController,
} from './report.csv.excel.controller';

const router = express.Router();

router.use(auth(USER_ROLES.USER));

router.route('/monthly').get(monthlyReportController);
router.route('/yearly').get(yearlyReportController);
router.route('/pdf').get(reportPdfController);
router.route('/csv').get(reportCSVController);
router.route('/excel').get(reportExcelController);

export const ReportRoutes = router;
