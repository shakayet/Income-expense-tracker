"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppPurchaseRoutes = void 0;
const express_1 = __importDefault(require("express"));
const inapp_controller_1 = require("./inapp.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router
    .route('/')
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), inapp_controller_1.createPurchase)
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER), inapp_controller_1.getAllPurchases);
router.get('/premium-status', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), inapp_controller_1.getPremiumStatus);
router.get('/purchase-history', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), inapp_controller_1.getUserPurchaseHistory);
router
    .route('/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER), inapp_controller_1.getSinglePurchase)
    .delete((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), inapp_controller_1.deletePurchase);
/**
 * Admin route: GET /admin/users/:userId/purchase-history
 * Allows ADMIN and SUPER_ADMIN to view purchase history for any user
 */
router.get('/admin/users/:userId/purchase-history', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), inapp_controller_1.getAdminUserPurchaseHistory);
exports.InAppPurchaseRoutes = router;
