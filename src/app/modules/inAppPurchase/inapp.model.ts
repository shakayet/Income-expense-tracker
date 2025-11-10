import { Schema, model } from 'mongoose';
import { IInAppPurchase } from './inapp.interface';

const inAppPurchaseSchema = new Schema<IInAppPurchase>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: String,
      required: true,
      trim: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const InAppPurchase = model<IInAppPurchase>('InAppPurchase', inAppPurchaseSchema);
