/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  _id?: Types.ObjectId;
  name: string;
  role: USER_ROLES;
  contact: string;
  email: string;
  password: string;
  preferredLanguage: string;
  image?: string;
  pin?: string;
  verified: boolean;
  fcmToken?: { type: string } | null;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): Promise<IUser | null>;
  isExistUserByEmail(email: string): Promise<IUser | null>;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
