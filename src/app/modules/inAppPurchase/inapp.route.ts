import express from 'express';
import { InAppPurchaseController } from './inapp.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .post(auth(USER_ROLES.USER), InAppPurchaseController.createPurchase)
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), InAppPurchaseController.getAllPurchases); //single user all purchases

router
  .route('/:id')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),InAppPurchaseController.getSinglePurchase)
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), InAppPurchaseController.deletePurchase);

export const InAppPurchaseRoutes = router;
