import { Model, Types } from 'mongoose';

export interface IMarketplaceFilterables {
  searchTerm?: string;
  name?: string;
  image?: string;
  marketplace?: string;
  productUrl?: string;
}

export interface IMarketplace {
  _id: Types.ObjectId;
  name: string;
  price: number;
  image: string;
  marketplace: string;
  productUrl: string;
}

export interface paginationFields {}

export type MarketplaceModel = Model<IMarketplace, {}, {}>;

export interface ISearchType {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: 'GENERIC' | 'API';
}

export type SearchTypeModel = Model<ISearchType, {}, {}>;
