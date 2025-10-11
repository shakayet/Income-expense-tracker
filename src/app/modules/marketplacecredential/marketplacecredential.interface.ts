import { Model, Types } from 'mongoose';

export interface IMarketplacecredentialFilterables {
  searchTerm?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  marketplaceId?: string;
}

export interface IMarketplacecredential {
  _id: Types.ObjectId;
  marketplaceName: 'amazon' | 'ebay' | 'alibaba' | 'zalando' | 'leroy_merlin';
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  marketplaceId?: string;
  environment?: 'sandbox' | 'production';
  createdAt?: Date;
  updatedAt?: Date;
}

export type MarketplacecredentialModel = Model<IMarketplacecredential, {}, {}>;
