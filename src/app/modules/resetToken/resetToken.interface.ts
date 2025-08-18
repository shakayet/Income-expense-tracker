/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export type IResetToken = {
  user: Types.ObjectId;
  token: string;
  expireAt: Date;
};

export type ResetTokenModel = {
  isExistToken(_token: string): Promise<IResetToken | null>;
  isExpireToken(_token: string): boolean;
} & Model<IResetToken>;
