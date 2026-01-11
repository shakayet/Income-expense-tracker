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
exports.MarketplacecredentialServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const marketplacecredential_model_1 = require("./marketplacecredential.model");
const mongoose_1 = require("mongoose");
const createMarketplacecredential = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield marketplacecredential_model_1.Marketplacecredential.create(payload);
        if (!result) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Marketplacecredential, please try again with valid data.');
        }
        return result;
    }
    catch (error) {
        if (error.code === 11000) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Duplicate entry found');
        }
        throw error;
    }
});
const getSingleMarketplacecredential = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Marketplacecredential ID');
    }
    const result = yield marketplacecredential_model_1.Marketplacecredential.findById(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested marketplacecredential not found, please try again with valid id');
    }
    return result;
});
const getAllMarketplacecredentials = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield marketplacecredential_model_1.Marketplacecredential.find();
    return result;
});
const getLatestMarketplacecredentialsByName = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, }) {
    console.log('Name:', name);
    const result = yield marketplacecredential_model_1.Marketplacecredential.findOne({
        marketplaceName: name,
    }).sort({ createdAt: -1 });
    if (!result) {
        throw new Error('No marketplace credential found for this name');
    }
    return result;
});
const updateMarketplacecredential = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Marketplacecredential ID');
    }
    const result = yield marketplacecredential_model_1.Marketplacecredential.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: payload }, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested marketplacecredential not found, please try again with valid id');
    }
    return result;
});
const deleteMarketplacecredential = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Marketplacecredential ID');
    }
    const result = yield marketplacecredential_model_1.Marketplacecredential.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting marketplacecredential, please try again with valid id.');
    }
    return result;
});
const deleteAllMarketplacecredentials = () => __awaiter(void 0, void 0, void 0, function* () {
    yield marketplacecredential_model_1.Marketplacecredential.deleteMany({});
});
exports.MarketplacecredentialServices = {
    createMarketplacecredential,
    getSingleMarketplacecredential,
    getAllMarketplacecredentials,
    updateMarketplacecredential,
    deleteMarketplacecredential,
    getLatestMarketplacecredentialsByName,
    deleteAllMarketplacecredentials,
};
