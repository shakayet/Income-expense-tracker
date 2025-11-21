"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("./review.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
// PATCH /admin/review/:id to set status to resolved
// import { createReviewController, getReviewAnalyticsController } from './review.controller';
const router = express_1.default.Router();
router
    .route('/')
    .post((0, auth_1.default)(user_1.USER_ROLES.USER), review_controller_1.createReview) // User adds review
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), review_controller_1.getAllReviews); // Admin fetch all
// router.route('/me').get(auth(USER_ROLES.USER), getUserReviews); // User’s own reviews
router.patch('/admin/review/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), review_controller_1.markReviewResolved);
router
    .route('/:id')
    .delete((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), review_controller_1.deleteReview);
router.get('/analytics', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), review_controller_1.getAnalyticsController);
exports.ReviewRoutes = router;
