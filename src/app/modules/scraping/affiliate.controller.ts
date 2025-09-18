// src/controllers/affiliate.controller.ts

import { Request, Response } from 'express';
import { AffiliateService } from './affiliate.service';
import { ApiCredentials } from './/affiliate.model';

const affiliateService = new AffiliateService();

export class AffiliateController {
  public async setCredentials(req: Request, res: Response): Promise<void> {
    const newCreds: Partial<ApiCredentials> = req.body;
    if (!newCreds || Object.keys(newCreds).length === 0) {
      res.status(400).json({ error: 'Request body must contain credentials.' });
      return;
    }
    affiliateService.setCredentials(newCreds);
    res.status(200).json({ message: 'Credentials updated successfully.' });
  }

  public async testCredentials(req: Request, res: Response): Promise<void> {
    const credsToTest: Partial<ApiCredentials> = req.body;
    if (!credsToTest || Object.keys(credsToTest).length === 0) {
      res.status(400).json({ error: 'Request body must contain credentials to test.' });
      return;
    }
    const isValid = await affiliateService.testCredentials(credsToTest);
    if (isValid) {
      res.status(200).json({ message: 'Credentials are valid.' });
    } else {
      res.status(401).json({ error: 'Credentials are invalid or unauthorized.' });
    }
  }

  public async searchProducts(req: Request, res: Response): Promise<void> {
    const { query, maxPrice } = req.query;
    const searchQuery = query as string;
    const priceLimit = parseFloat(maxPrice as string);
    if (!searchQuery || isNaN(priceLimit) || priceLimit <= 0) {
      res.status(400).json({ error: 'Invalid query or maxPrice' });
      return;
    }
    try {
      const products = await affiliateService.searchProducts(searchQuery, priceLimit);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}