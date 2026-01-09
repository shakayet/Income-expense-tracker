import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import {
  IMarketplacecredentialFilterables,
  IMarketplacecredential,
} from './marketplacecredential.interface';
import { Marketplacecredential } from './marketplacecredential.model';
import { JwtPayload } from 'jsonwebtoken';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { marketplacecredentialSearchableFields } from './marketplacecredential.constants';
import { Types } from 'mongoose';
import { IPaginationOptions } from '../../../types/pagination';

const createMarketplacecredential = async (
  user: JwtPayload,
  payload: IMarketplacecredential
): Promise<IMarketplacecredential> => {
  try {
    const result = await Marketplacecredential.create(payload);
    if (!result) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Marketplacecredential, please try again with valid data.'
      );
    }

    return result;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found');
    }
    throw error;
  }
};

const getSingleMarketplacecredential = async (
  id: string
): Promise<IMarketplacecredential> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid Marketplacecredential ID'
    );
  }

  const result = await Marketplacecredential.findById(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested marketplacecredential not found, please try again with valid id'
    );
  }

  return result;
};

const getAllMarketplacecredentials = async () => {
  const result = await Marketplacecredential.find();
  return result;
};

const getLatestMarketplacecredentialsByName = async ({
  name,
}: {
  name: string;
}) => {
  console.log('Name:', name);
  const result = await Marketplacecredential.findOne({
    marketplaceName: name,
  }).sort({ createdAt: -1 });

  if (!result) {
    throw new Error('No marketplace credential found for this name');
  }

  return result;
};

const updateMarketplacecredential = async (
  id: string,
  payload: Partial<IMarketplacecredential>
): Promise<IMarketplacecredential | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid Marketplacecredential ID'
    );
  }

  const result = await Marketplacecredential.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested marketplacecredential not found, please try again with valid id'
    );
  }

  return result;
};

const deleteMarketplacecredential = async (
  id: string
): Promise<IMarketplacecredential> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid Marketplacecredential ID'
    );
  }

  const result = await Marketplacecredential.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting marketplacecredential, please try again with valid id.'
    );
  }

  return result;
};

const deleteAllMarketplacecredentials = async (): Promise<void> => {
  await Marketplacecredential.deleteMany({});
};

export const MarketplacecredentialServices = {
  createMarketplacecredential,
  getSingleMarketplacecredential,
  getAllMarketplacecredentials,
  updateMarketplacecredential,
  deleteMarketplacecredential,
  getLatestMarketplacecredentialsByName,
  deleteAllMarketplacecredentials,
};
