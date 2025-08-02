import { Category } from './category.model';
import { ICategory } from './category.interface';

const createCategory = async (data: ICategory) => {
  return await Category.create(data);
};

const getUserCategories = async (userId: string) => {
  return await Category.find({ user: userId });
};

const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  const updated = await Category.findByIdAndUpdate(id, payload, { new: true });
  return updated;
};

const deleteCategory = async (id: string) => {
  const deleted = await Category.findByIdAndDelete(id);
  return deleted;
};


export const CategoryService = {
  updateCategory,
  deleteCategory,
  getUserCategories,
  createCategory,
};
