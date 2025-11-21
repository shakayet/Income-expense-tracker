"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const marketplace_model_1 = require("./marketplace.model");
const mongoose_1 = require("mongoose");
const getSingleMarketplace = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Marketplace ID');
    }
    const result = yield marketplace_model_1.Marketplace.findById(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested marketplace not found, please try again with valid id');
    }
    return result;
});
const updateMarketplace = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Marketplace ID');
    }
    const result = yield marketplace_model_1.Marketplace.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: payload }, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested marketplace not found, please try again with valid id');
    }
    return result;
});
const deleteMarketplace = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Marketplace ID');
    }
    const result = yield marketplace_model_1.Marketplace.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting marketplace, please try again with valid id.');
    }
    return result;
});
const getSearchType = (user) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hit');
    const all = yield marketplace_model_1.SearchTypeModel.find({});
    console.log({ all });
    const result = yield marketplace_model_1.SearchTypeModel.findOne({});
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested SearchType not found');
    }
    return result;
});
const createSearchType = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if there's already a search type
        const existingSearchType = yield marketplace_model_1.SearchTypeModel.findOne({});
        if (existingSearchType) {
            // Update the existing one instead of creating a new one
            const updated = yield marketplace_model_1.SearchTypeModel.findByIdAndUpdate(existingSearchType._id, { $set: payload }, { new: true } // return the updated doc
            );
            if (!updated) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update SearchType, please try again.');
            }
            return updated;
        }
        else {
            // No existing -> create a new entry
            const created = yield marketplace_model_1.SearchTypeModel.create(payload);
            if (!created) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create SearchType, please try again.');
            }
            return created;
        }
    }
    catch (error) {
        if (error.code === 11000) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Duplicate entry found');
        }
        throw error;
    }
});
exports.MarketplaceServices = {
    getSingleMarketplace,
    updateMarketplace,
    deleteMarketplace,
    createSearchType,
    getSearchType,
};
