import { Types } from 'mongoose';

export interface ICategory {
  name: string;
  icon: string;
  userId: Types.ObjectId;
}
