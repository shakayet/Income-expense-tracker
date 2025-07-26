import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['monthly-report', 'yearly-report', 'budget-warning'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  reportMonth: { type: String },
  reportYear: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = model<INotification>(
  'Notification',
  NotificationSchema
);
