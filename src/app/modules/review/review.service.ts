import { Review } from './review.model';
import { IReview } from './review.interface';

// Create new review
export const createReview = async (payload: IReview) => {
  const review = new Review(payload);
  return await review.save();
};

// Get all reviews (admin / super admin)
export const getAllReviews = async () => {
  return await Review.find().populate('user', 'name email');
};

// Delete review (admin/super admin)
export const deleteReview = async (id: string) => {
  return await Review.findByIdAndDelete(id);
};
