import express from 'express';
import {
  createPurchase,
  getAllPurchases,
  getSinglePurchase,
  deletePurchase,
  checkPremiumStatus,
  getUserPurchaseHistory,
} from './inapp.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .post(auth(USER_ROLES.USER), createPurchase)
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    getAllPurchases
  ); 

router.get('/premium-status', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), checkPremiumStatus);

router.get('/purchase-history', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), getUserPurchaseHistory);

router
  .route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    getSinglePurchase
  )
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), deletePurchase);

export const InAppPurchaseRoutes = router;
