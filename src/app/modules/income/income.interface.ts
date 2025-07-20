import { Schema, Types, model } from 'mongoose';

export interface IIncome {
  userId: Types.ObjectId;
  source: 'salary' | 'business' | 'gift' | 'rent' | 'freelancing' | 'others';
  amount: number;
  date: Date;
  month: string;
}