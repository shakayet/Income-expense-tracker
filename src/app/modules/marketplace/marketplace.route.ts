import express from 'express';
import { MarketplaceController } from './marketplace.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// Route for /searchType → POST (⚡ place this first)
router
  .route('/searchType')
  .get(MarketplaceController.getSearchType) // e.g. to fetch history/list
  .post(
    // auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    MarketplaceController.createSearchType
  );

// Route for /search → GET
router.route('/search').get(MarketplaceController.searchProduct);

// Route for /product/:id → GET
router.route('/product/:id').get(MarketplaceController.getSingleProduct);

// Routes for /:id → DELETE (⚠ must come after all specific routes)
router
  .route('/:id')
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    MarketplaceController.deleteMarketplace
  );

export const MarketplaceRoutes = router;
