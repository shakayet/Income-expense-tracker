import { resolveReview } from './review.service';

// PATCH /admin/review/:id to set status to resolved
export const markReviewResolved = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await resolveReview(id);
    res
      .status(200)
      .json({
        success: true,
        message: 'Review marked as resolved',
        data: review,
      });
  } catch (error) {
    res
      .status(404)
      .json({
        success: false,
        message: error instanceof Error ? error.message : 'Error',
      });
  }
};
import { Request, Response } from 'express';
import * as ReviewService from './review.service';

export const createReview = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const review = await ReviewService.createReview({
      ...req.body,
      user: req.user.id, // From token
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An error occurred';
    res.status(400).json({ success: false, message });
  }
};

export const getAllReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await ReviewService.getAllReviews();
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An error occurred';
    res.status(500).json({ success: false, message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const deleted = await ReviewService.deleteReview(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: 'Review not found' });
    }
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An error occurred';
    res.status(500).json({ success: false, message });
  }
};

// --- New: Analytics + Recent Reviews ---
export const getAnalyticsController = async (_req: Request, res: Response) => {
  try {
    const analytics = await ReviewService.getAnalytics();
    res.status(200).json({ success: true, ...analytics });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An error occurred';
    res.status(500).json({ success: false, message });
  }
};
