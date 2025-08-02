import { Category } from './category.model';
import { ICategory } from './category.interface';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

export const createCategory = async (payload: ICategory, userId: string) => {
  const { name, icon } = payload;

  // Check if this category already exists globally (default or custom by user)
  const existingCategory = await Category.findOne({
    name: new RegExp(`^${name}$`, 'i'), // case-insensitive match
    icon,
    $or: [
      { isDefault: true },
      { userId }, // matches current user's custom categories
    ],
  });

  if (existingCategory) {
    throw new Error('Category with same name and icon already exists');
  }

  const category = await Category.create({
    ...payload,
    userId,
    isDefault: false,
  });

  return category;
};

const getAllCategories = async (userId: string) => {
  const categories = await Category.find({
    $or: [
      { userId: null }, // Default categories
      { userId: userId }, // Custom categories created by this user
    ],
  });

  return categories;
};

const updateCategory = async (
  categoryId: string,
  userId: string,
  updateData: Partial<ICategory>
) => {
  const category = await Category.findOneAndUpdate(
    { _id: categoryId, userId }, // ✅ user-scoped
    updateData,
    { new: true }
  );

  if (!category)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Category not found or unauthorized'
    );
  return category;
};

const deleteCategory = async (categoryId: string, userId: string) => {
  const category = await Category.findOneAndDelete({ _id: categoryId, userId }); // ✅ scoped

  if (!category)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Category not found or unauthorized'
    );
  return category;
};

export const CategoryService = {
  updateCategory,
  deleteCategory,
  getAllCategories,
  createCategory,
};
