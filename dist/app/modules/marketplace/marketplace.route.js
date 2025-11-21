"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const marketplace_controller_1 = require("./marketplace.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
// Route for /searchType → POST (⚡ place this first)
router
    .route('/searchType')
    .get(marketplace_controller_1.MarketplaceController.getSearchType) // e.g. to fetch history/list
    .post(
// auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
marketplace_controller_1.MarketplaceController.createSearchType);
// Route for /search → GET
router.route('/search').get(marketplace_controller_1.MarketplaceController.searchProduct);
// Route for /product/:id → GET
router.route('/product/:id').get(marketplace_controller_1.MarketplaceController.getSingleProduct);
// Routes for /:id → DELETE (⚠ must come after all specific routes)
router
    .route('/:id')
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN), marketplace_controller_1.MarketplaceController.deleteMarketplace);
exports.MarketplaceRoutes = router;
