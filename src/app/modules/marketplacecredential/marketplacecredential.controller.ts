import { Request, Response } from 'express';
import { MarketplacecredentialServices } from './marketplacecredential.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { marketplacecredentialFilterables } from './marketplacecredential.constants';

const createMarketplacecredential = catchAsync(
  async (req: Request, res: Response) => {
    const marketplacecredentialData = req.body;

    const result =
      await MarketplacecredentialServices.createMarketplacecredential(
        req.user!,
        marketplacecredentialData
      );

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Marketplacecredential created successfully',
      data: result,
    });
  }
);

const getAllMarketplacecredentials = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await MarketplacecredentialServices.getAllMarketplacecredentials();

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Marketplacecredential created successfully',
      data: result,
    });
  }
);

const getLatestMarketplacecredentialsByName = catchAsync(
  async (req: Request, res: Response) => {
    const { marketplaceName } = req.body;
    const result =
      await MarketplacecredentialServices.getLatestMarketplacecredentialsByName(
        { name: marketplaceName }
      );

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Marketplacecredential created successfully',
      data: result,
    });
  }
);

const updateMarketplacecredential = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const marketplacecredentialData = req.body;

    const result =
      await MarketplacecredentialServices.updateMarketplacecredential(
        id,
        marketplacecredentialData
      );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Marketplacecredential updated successfully',
      data: result,
    });
  }
);

const getSingleMarketplacecredential = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await MarketplacecredentialServices.getSingleMarketplacecredential(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Marketplacecredential retrieved successfully',
      data: result,
    });
  }
);

const deleteMarketplacecredential = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result =
      await MarketplacecredentialServices.deleteMarketplacecredential(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Marketplacecredential deleted successfully',
      data: result,
    });
  }
);

export const MarketplacecredentialController = {
  createMarketplacecredential,
  updateMarketplacecredential,
  getAllMarketplacecredentials,
  getSingleMarketplacecredential,
  deleteMarketplacecredential,
  getLatestMarketplacecredentialsByName,
};
