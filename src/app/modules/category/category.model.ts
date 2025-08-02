import { Schema, model } from 'mongoose';
import { ICategory } from './category.interface';

const categorySchema = new Schema<ICategory>({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  name: { type: String, required: true },
  icon: { type: String, required: true },
});

export const Category = model<ICategory>('Category', categorySchema);
