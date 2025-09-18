// src/routes/affiliate.routes.ts

import { Router } from 'express';
import { AffiliateController } from './affiliate.controller';
import auth from '../../middlewares/auth';

const router = Router();
const affiliateController = new AffiliateController();

router.post(
  '/credentials',
  auth('SUPER_ADMIN', 'ADMIN'),
  affiliateController.setCredentials
);
router.patch(
  '/credentials',
  auth('SUPER_ADMIN', 'ADMIN'),
  affiliateController.setCredentials
);
router.post(
  '/credentials/test',
  auth('SUPER_ADMIN', 'ADMIN'),
  affiliateController.testCredentials
);

router.get('/search', auth('USER'), affiliateController.searchProducts);

export const Scraping = router;
