/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { MarketplaceServices } from './marketplace.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

import {
  getCheapestAmazonProducts,
  getSingleAmazonProduct,
  getSingleProductFromEbay,
  getTopCheapestProductsFromEbay,
} from './util';
import { SearchTypeModel } from './marketplace.model';
import { genericSearch } from '../scraping/affiliate.service';

const updateMarketplace = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const marketplaceData = req.body;

  const result = await MarketplaceServices.updateMarketplace(
    id,
    marketplaceData
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Marketplace updated successfully',
    data: result,
  });
});

const deleteMarketplace = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MarketplaceServices.deleteMarketplace(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Marketplace deleted successfully',
    data: result,
  });
});

export async function searchProduct(req: Request, res: Response) {
  try {
    const query = (req.query.product as string) || 'bike';
    const country = (req.query.country as string) || undefined;
    // const maxPrice = Number(req.query.maxPrice) || 999999;

    // ✅ Get the current search type
    const searchType = await SearchTypeModel.findOne({});

    let result: Record<string, any> = {};

    // ==============================
    // 🔹 CASE 1: API Search Mode
    // ==============================
    if (searchType?.type === 'API') {
      console.log('🔍 Performing API-based search...');

      // single-country (or default) search
      const ct = country || 'IT';
      const [amazon, ebay] = await Promise.all([
        getCheapestAmazonProducts(query, 5, ct),
        getTopCheapestProductsFromEbay(query, 5, ct),
      ]);
      result = { amazon, ebay };
    }

    // ==============================
    // 🔹 CASE 2: GENERIC Search Mode
    // ==============================
    else if (searchType?.type === 'GENERIC') {
      console.log('🔍 Performing GENERIC (link-based) search...');

      const sites = [
        'Amazon',
        'Temu',
        'Subito',
        'Alibaba',
        'Zalando',
        'Mediaworld',
        'Notino',
        'Douglas',
        'Leroy Merlin',
        'Back Market',
        'Swappie',
      ];

      // Run all generic searches concurrently
      const genericResults = await Promise.all(
        sites.map(site => genericSearch(site, query))
      );

      // Flatten and merge results
      const mergedResults = genericResults.flat();

      result = { generic: mergedResults };
    }

    // ==============================
    // 🔹 CASE 3: Fallback (no type)
    // ==============================
    else {
      console.log('⚠️ No search type configured in database.');
      result = { message: 'No valid search type found in system.' };
    }

    // ✅ Send the unified response
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('❌ Error fetching products:', err);
    res.status(500).json({
      success: false,
      error: err?.response?.data || err.message,
    });
  }
}

export const getSingleProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { source } = req.query;
    // const result = await getSingleAmazonProduct(id);

    console.log({ id, source });

    let result;

    if (source === 'ebay') {
      result = await getSingleProductFromEbay(id);
    } else if (source === 'amazon') {
      result = await getSingleAmazonProduct(id);
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: `Product retrieved successfully from ${source}`,
      data: result,
    });
  }
);

const createSearchType = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const marketplaceData = req.body;

  const result = await MarketplaceServices.createSearchType(
    user,
    marketplaceData
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'SearchType created successfully',
    data: result,
  });
});

const getSearchType = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  // const marketplaceData = req.body;

  const result = await MarketplaceServices.getSearchType(user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'SearchType data retrieved successfully',
    data: result,
  });
});

export const MarketplaceController = {
  updateMarketplace,
  getSingleProduct,
  deleteMarketplace,

  searchProduct,
  createSearchType,
  getSearchType,
};
