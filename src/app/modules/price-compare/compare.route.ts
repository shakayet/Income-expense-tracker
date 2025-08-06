import express from 'express';
import { comparePriceController } from './compare.controller';

const comparePriceRoutes = express.Router();
comparePriceRoutes.route('/').post(comparePriceController);

export default comparePriceRoutes;
