import { Types } from 'mongoose';

export interface ICategory {
  userId: Types.ObjectId;
  name: string;
  icon: string;
}
