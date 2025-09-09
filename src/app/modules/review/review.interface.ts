import { Types } from 'mongoose';

export type IReview = {
  user: Types.ObjectId; // Reference to User
  rating: number; // 1 - 5
  comment?: string; // Optional feedback
  status?: 'pending' | 'resolved';
};
