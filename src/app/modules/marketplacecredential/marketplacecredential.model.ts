import { Schema, model } from 'mongoose';
import {
  IMarketplacecredential,
  MarketplacecredentialModel,
} from './marketplacecredential.interface';

const marketplacecredentialSchema = new Schema<
  IMarketplacecredential,
  MarketplacecredentialModel
>(
  {
    marketplaceName: {
      type: String,
      enum: ['amazon', 'ebay', 'alibaba', 'zalando', 'leroy_merlin'],
      required: true,
    },

    clientId: { type: String },
    clientSecret: { type: String },
    refreshToken: { type: String },
    awsAccessKeyId: { type: String },
    awsSecretAccessKey: { type: String },
    marketplaceId: { type: String },
    environment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox',
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Marketplacecredential = model<
  IMarketplacecredential,
  MarketplacecredentialModel
>('Marketplacecredential', marketplacecredentialSchema);
