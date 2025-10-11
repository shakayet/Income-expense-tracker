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

async function searchProduct(req: Request, res: Response) {
  try {
    const query = (req.query.text as string) || 'bike';

    // Run both API calls concurrently
    const [amazon, ebay] = await Promise.all([
      getCheapestAmazonProducts(query),
      getTopCheapestProductsFromEbay(query),
    ]);

    console.log({ amazon, ebay });

    res.json({ amazon, ebay });
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err?.response?.data || err.message });
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
  const marketplaceData = req.body;

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
