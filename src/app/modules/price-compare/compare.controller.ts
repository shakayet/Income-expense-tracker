import { Request, Response } from 'express';
import { comparePrices } from './compare.service';

export const comparePriceController = async (req: Request, res: Response) => {
  const { product, maxPrice } = req.body;

  if (!product || !maxPrice)
    return res.status(400).json({ message: 'Missing product or maxPrice' });

  const result = await comparePrices(product, maxPrice);
  res.json(result);
};
