import express from 'express';
import { monthlyReport, yearlyReport } from './report.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.use(auth());

router.get('/monthly', monthlyReport);
router.get('/yearly', yearlyReport);

export const ReportRoutes = router;
