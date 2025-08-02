import express from 'express';
import { createCategory, getCategories } from './category.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createCategoryZodSchema } from './category.validation';

const router = express.Router();

router
  .route('/')
  .post(validateRequest(createCategoryZodSchema), createCategory)
  .get(getCategories);

export const CategoryRoutes = router;
