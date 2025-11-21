"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getRecentReviews = exports.getAnalytics = exports.getAllReviews = exports.createReview = exports.resolveReview = void 0;
// Update review status to resolved (admin only)
const resolveReview = (reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield review_model_1.Review.findById(reviewId);
    if (!review)
        throw new Error('Review not found');
    review.status = 'resolved';
    yield review.save();
    return review;
});
exports.resolveReview = resolveReview;
const review_model_1 = require("./review.model");
const createReview = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const review = new review_model_1.Review(payload);
    return yield review.save();
});
exports.createReview = createReview;
const getAllReviews = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield review_model_1.Review.find().sort({ createdAt: -1 });
});
exports.getAllReviews = getAllReviews;
// Analytics: rating percentage breakdown
const getAnalytics = () => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch all reviews
    const reviews = yield review_model_1.Review.find().sort({ createdAt: -1 });
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
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumRating = 0;
    reviews.forEach(r => {
        const rating = Math.round(r.rating);
        if (rating >= 1 && rating <= 5) {
            counts[rating] += 1;
            sumRating += r.rating;
        }
    });
    // Convert counts → percentage
    const stats = {};
    for (const key in counts) {
        const numKey = Number(key);
        stats[numKey] = parseFloat(((counts[numKey] / totalReviews) * 100).toFixed(2)); // percentage
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
});
exports.getAnalytics = getAnalytics;
// Recent reviews (latest 3)
const getRecentReviews = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield review_model_1.Review.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('user', 'name'); // assuming user model has 'name'
});
exports.getRecentReviews = getRecentReviews;
const deleteReview = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield review_model_1.Review.findByIdAndDelete(id);
});
exports.deleteReview = deleteReview;
