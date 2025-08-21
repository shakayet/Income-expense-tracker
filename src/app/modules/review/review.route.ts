import express from 'express';
import {
  createReview,
  getAllReviews,
  deleteReview,
  getReviewAnalytics,
} from './review.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
// import { createReviewController, getReviewAnalyticsController } from './review.controller';

const router = express.Router();

router
  .route('/')
  .post(auth(USER_ROLES.USER), createReview) // User adds review
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), getAllReviews); // Admin fetch all

// router.route('/me').get(auth(USER_ROLES.USER), getUserReviews); // User’s own reviews

router
  .route('/:id')
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), deleteReview);

router.get(
  '/analytics',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  getReviewAnalytics
);

export const ReviewRoutes = router;
