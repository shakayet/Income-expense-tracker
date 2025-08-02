import { Category } from './category.model';
import { ICategory } from './category.interface';

export const createCategory = async (data: ICategory) => {
  return await Category.create(data);
};

export const getUserCategories = async (userId: string) => {
  return await Category.find({ user: userId });
};
