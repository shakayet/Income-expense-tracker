import { Types } from 'mongoose';

export type ICategory = {
  userId: Types.ObjectId;
  name: string;
  icon: string;
}
