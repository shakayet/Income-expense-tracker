import express from 'express';
import { MarketplacecredentialController } from './marketplacecredential.controller';
import { MarketplacecredentialValidations } from './marketplacecredential.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.get(
  '/latest',
  // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  MarketplacecredentialController.getLatestMarketplacecredentialsByName
);

router.get(
  '/:id',
  // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  MarketplacecredentialController.getSingleMarketplacecredential
);
router.get(
  '/',
  // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  MarketplacecredentialController.getAllMarketplacecredentials
);

router.post(
  '/',
  // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),

  validateRequest(MarketplacecredentialValidations.create),
  MarketplacecredentialController.createMarketplacecredential
);

router.patch(
  '/:id',
  // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),

  validateRequest(MarketplacecredentialValidations.update),
  MarketplacecredentialController.updateMarketplacecredential
);

router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  MarketplacecredentialController.deleteMarketplacecredential
);

export const MarketplacecredentialRoutes = router;
