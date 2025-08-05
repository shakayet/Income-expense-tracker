import express from 'express';
import { comparePriceController } from './compare.controller';

const router = express.Router();

router.route('/').post(comparePriceController);

export default router;
