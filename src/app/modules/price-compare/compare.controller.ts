/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { comparePrices } from './compare.service';
import CostCompare from './compare.model';

export const comparePriceController = async (req: Request, res: Response) => {
  const { product, maxPrice } = req.body;

  if (!product || !maxPrice)
    return res.status(400).json({ message: 'Missing product or maxPrice' });

  const result = await comparePrices(product, maxPrice);
  res.json(result);
};

export const addCostCompare = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { initialPrice, finalPrice, costType } = req.body;

    const savedAmount = initialPrice - finalPrice;

    const data = await CostCompare.create({
      user: req.user.id,
      initialPrice,
      finalPrice,
      savedAmount,
      costType,
    });

    res.status(201).json({
      success: true,
      message: 'Cost comparison added successfully',
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCostCompareHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const data = await CostCompare.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: 'Fetched cost compare history',
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
