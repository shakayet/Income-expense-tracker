import { Model, Types } from 'mongoose';

export type ISavings = {
  userId: Types.ObjectId;
  category: string;
  initialPrice: number;
  actualPrice: number;
  savings: number;
}

export type SavingsModel = Model<ISavings>;
