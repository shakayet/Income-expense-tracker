import express from 'express';
import { createCategory, deleteCategory, getAllCategories, updateCategory } from './category.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createCategoryZodSchema } from './category.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();
router.use(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router
  .route('/')
  .post(validateRequest(createCategoryZodSchema), createCategory)
  .get(getAllCategories);

router
  .route('/:id')
  .patch(validateRequest(createCategoryZodSchema), updateCategory)
  .delete(deleteCategory);

export const CategoryRoutes = router;
