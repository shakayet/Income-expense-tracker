import { Types } from 'mongoose';

export type IIncome = {
  userId: Types.ObjectId;
  source: 'salary' | 'business' | 'gift' | 'rent' | 'freelancing' | 'others';
  amount: number;
  date: Date;
  month: string;
}