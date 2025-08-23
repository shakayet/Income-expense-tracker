import { Review } from './review.model';
import { IReview } from './review.interface';

export const createReview = async (payload: IReview) => {
  const review = new Review(payload);
  return await review.save();
};

export const getAllReviews = async () => {
  return await Review.find().sort({ createdAt: -1 });
};

// Analytics: rating percentage breakdown
export const getAnalytics = async () => {
  // Fetch all reviews
  const reviews = await Review.find().sort({ createdAt: -1 });

  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    return {
      stats: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      averageRating: 0,
      totalReviews: 0,
      recent: [],
    };
  }

  // Rating count
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sumRating = 0;

  reviews.forEach(r => {
    const rating = Math.round(r.rating);
    if (rating >= 1 && rating <= 5) {
      counts[rating] += 1;
      sumRating += r.rating;
    }
  });

  // Convert counts → percentage
  const stats: Record<number, number> = {};
  for (const key in counts) {
    const numKey = Number(key) as 1 | 2 | 3 | 4 | 5;
    stats[numKey] = parseFloat(
      ((counts[numKey] / totalReviews) * 100).toFixed(2)
    ); // percentage
  }

  const averageRating = parseFloat((sumRating / totalReviews).toFixed(2));

  // Recent 3 reviews
  const recent = reviews.slice(0, 3).map(r => ({
    user: r.user,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.get('createdAt'),
  }));

  return { stats, averageRating, totalReviews, recent };
};

// Recent reviews (latest 3)
export const getRecentReviews = async () => {
  return await Review.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('user', 'name'); // assuming user model has 'name'
};

export const deleteReview = async (id: string) => {
  return await Review.findByIdAndDelete(id);
};
