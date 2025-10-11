import { Schema, model } from 'mongoose';
import {
  IMarketplace,
  ISearchType,
  MarketplaceModel,
} from './marketplace.interface';

const marketplaceSchema = new Schema<IMarketplace, MarketplaceModel>(
  {
    name: { type: String },
    price: { type: Number },
    image: { type: String },
    marketplace: { type: String },
    productUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Marketplace = model<IMarketplace, MarketplaceModel>(
  'Marketplace',
  marketplaceSchema
);

const searchTypeSchema = new Schema<ISearchType>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['GENERIC', 'API'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SearchTypeModel = model<ISearchType>(
  'SearchType',
  searchTypeSchema
);
