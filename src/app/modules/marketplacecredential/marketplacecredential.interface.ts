/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
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
  api_key?: string;
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  marketplaceId?: string;
  environment?: 'sandbox' | 'production';
  country?: string;
  region?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MarketplacecredentialModel = Model<IMarketplacecredential, {}, {}>;
