import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import {
  IMarketplaceFilterables,
  IMarketplace,
  ISearchType,
} from './marketplace.interface';
import { Marketplace, SearchTypeModel } from './marketplace.model';
import { JwtPayload } from 'jsonwebtoken';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { marketplaceSearchableFields } from './marketplace.constants';
import { Types } from 'mongoose';

const getSingleMarketplace = async (id: string): Promise<IMarketplace> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Marketplace ID');
  }

  const result = await Marketplace.findById(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested marketplace not found, please try again with valid id'
    );
  }

  return result;
};

const updateMarketplace = async (
  id: string,
  payload: Partial<IMarketplace>
): Promise<IMarketplace | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Marketplace ID');
  }

  const result = await Marketplace.findByIdAndUpdate(
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
      'Requested marketplace not found, please try again with valid id'
    );
  }

  return result;
};

const deleteMarketplace = async (id: string): Promise<IMarketplace> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Marketplace ID');
  }

  const result = await Marketplace.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting marketplace, please try again with valid id.'
    );
  }

  return result;
};

const getSearchType = async (user: JwtPayload): Promise<ISearchType> => {
  console.log('hit');
  const all = await SearchTypeModel.find({});

  console.log({ all });
  const result = await SearchTypeModel.findOne({});
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Requested SearchType not found');
  }

  return result;
};

const createSearchType = async (
  user: JwtPayload,
  payload: ISearchType
): Promise<ISearchType> => {
  try {
    // Check if there's already a search type
    const existingSearchType = await SearchTypeModel.findOne({});

    if (existingSearchType) {
      // Update the existing one instead of creating a new one
      const updated = await SearchTypeModel.findByIdAndUpdate(
        existingSearchType._id,
        { $set: payload },
        { new: true } // return the updated doc
      );

      if (!updated) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Failed to update SearchType, please try again.'
        );
      }

      return updated;
    } else {
      // No existing -> create a new entry
      const created = await SearchTypeModel.create(payload);
      if (!created) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Failed to create SearchType, please try again.'
        );
      }

      return created;
    }
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found');
    }
    throw error;
  }
};

export const MarketplaceServices = {
  getSingleMarketplace,
  updateMarketplace,
  deleteMarketplace,
  createSearchType,
  getSearchType,
};
