import express from 'express';
import { InAppPurchaseController } from './inApp.controller';

const router = express.Router();

router
  .route('/')
  .post(InAppPurchaseController.createPurchase)
  .get(InAppPurchaseController.getAllPurchases);

router
  .route('/:id')
  .get(InAppPurchaseController.getSinglePurchase)
  .delete(InAppPurchaseController.deletePurchase);

export const InAppPurchaseRoutes = router;
