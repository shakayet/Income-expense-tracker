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
exports.MarketplacecredentialController = void 0;
const marketplacecredential_service_1 = require("./marketplacecredential.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const createMarketplacecredential = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const marketplacecredentialData = req.body;
    const result = yield marketplacecredential_service_1.MarketplacecredentialServices.createMarketplacecredential(req.user, marketplacecredentialData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Marketplacecredential created successfully',
        data: result,
    });
}));
const getAllMarketplacecredentials = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield marketplacecredential_service_1.MarketplacecredentialServices.getAllMarketplacecredentials();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Marketplacecredential created successfully',
        data: result,
    });
}));
const getLatestMarketplacecredentialsByName = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { marketplaceName } = req.body;
    const result = yield marketplacecredential_service_1.MarketplacecredentialServices.getLatestMarketplacecredentialsByName({ name: marketplaceName });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Marketplacecredential created successfully',
        data: result,
    });
}));
const updateMarketplacecredential = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const marketplacecredentialData = req.body;
    const result = yield marketplacecredential_service_1.MarketplacecredentialServices.updateMarketplacecredential(id, marketplacecredentialData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Marketplacecredential updated successfully',
        data: result,
    });
}));
const getSingleMarketplacecredential = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield marketplacecredential_service_1.MarketplacecredentialServices.getSingleMarketplacecredential(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Marketplacecredential retrieved successfully',
        data: result,
    });
}));
const deleteMarketplacecredential = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield marketplacecredential_service_1.MarketplacecredentialServices.deleteMarketplacecredential(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Marketplacecredential deleted successfully',
        data: result,
    });
}));
const deleteAllMarketplacecredentials = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield marketplacecredential_service_1.MarketplacecredentialServices.deleteAllMarketplacecredentials();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'All Marketplacecredentials deleted successfully',
    });
}));
exports.MarketplacecredentialController = {
    createMarketplacecredential,
    updateMarketplacecredential,
    getAllMarketplacecredentials,
    getSingleMarketplacecredential,
    deleteMarketplacecredential,
    getLatestMarketplacecredentialsByName,
    deleteAllMarketplacecredentials,
};
