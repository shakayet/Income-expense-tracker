"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getAnalyticsController = exports.deleteReview = exports.getAllReviews = exports.createReview = exports.markReviewResolved = void 0;
const review_service_1 = require("./review.service");
// PATCH /admin/review/:id to set status to resolved
const markReviewResolved = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const review = yield (0, review_service_1.resolveReview)(id);
        res
            .status(200)
            .json({
            success: true,
            message: 'Review marked as resolved',
            data: review,
        });
    }
    catch (error) {
        res
            .status(404)
            .json({
            success: false,
            message: error instanceof Error ? error.message : 'Error',
        });
    }
});
exports.markReviewResolved = markReviewResolved;
const ReviewService = __importStar(require("./review.service"));
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const review = yield ReviewService.createReview(Object.assign(Object.assign({}, req.body), { user: req.user.id }));
        res.status(201).json({ success: true, data: review });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        res.status(400).json({ success: false, message });
    }
});
exports.createReview = createReview;
const getAllReviews = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviews = yield ReviewService.getAllReviews();
        res.status(200).json({ success: true, data: reviews });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        res.status(500).json({ success: false, message });
    }
});
exports.getAllReviews = getAllReviews;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield ReviewService.deleteReview(req.params.id);
        if (!deleted) {
            return res
                .status(404)
                .json({ success: false, message: 'Review not found' });
        }
        res.status(200).json({ success: true, message: 'Review deleted' });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        res.status(500).json({ success: false, message });
    }
});
exports.deleteReview = deleteReview;
// --- New: Analytics + Recent Reviews ---
const getAnalyticsController = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const analytics = yield ReviewService.getAnalytics();
        res.status(200).json(Object.assign({ success: true }, analytics));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        res.status(500).json({ success: false, message });
    }
});
exports.getAnalyticsController = getAnalyticsController;
