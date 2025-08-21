import { Review } from './review.model';
// import { IReview } from './review.interface';

export const createReview = async (userId: string, rating: number, comment: string) => {
  const review = new Review({ user: userId, rating, comment });
  return await review.save();
};

export const getAllReviews = async () => {
  return await Review.find().sort({ createdAt: -1 });
};

// Analytics: rating percentage breakdown
export const getRatingStats = async () => {
  const total = await Review.countDocuments();
  if (total === 0) return {};

  const ratings = await Review.aggregate([
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        rating: '$_id',
        percentage: { $multiply: [{ $divide: ['$count', total] }, 100] },
        _id: 0,
      },
    },
    { $sort: { rating: -1 } },
  ]);

  return ratings; // [{rating:5, percentage:50}, {rating:4, percentage:30}, ...]
};

// Recent reviews (latest 3)
export const getRecentReviews = async () => {
  return await Review.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('user', 'name'); // assuming user model has 'name'
};
