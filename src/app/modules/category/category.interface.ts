import { Types } from 'mongoose';

export interface ICategory {
  name: string;
  icon: string;
  user: Types.ObjectId;
}
