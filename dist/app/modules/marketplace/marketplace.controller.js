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
exports.MarketplaceController = exports.getSingleProduct = void 0;
exports.searchProduct = searchProduct;
const marketplace_service_1 = require("./marketplace.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const util_1 = require("./util");
const marketplace_model_1 = require("./marketplace.model");
const affiliate_service_1 = require("../scraping/affiliate.service");
const updateMarketplace = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const marketplaceData = req.body;
    const result = yield marketplace_service_1.MarketplaceServices.updateMarketplace(id, marketplaceData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Marketplace updated successfully',
        data: result,
    });
}));
const deleteMarketplace = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield marketplace_service_1.MarketplaceServices.deleteMarketplace(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Marketplace deleted successfully',
        data: result,
    });
}));
function searchProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const query = req.query.product || 'bike';
            const country = req.query.country || undefined;
            // const maxPrice = Number(req.query.maxPrice) || 999999;
            // ✅ Get the current search type
            const searchType = yield marketplace_model_1.SearchTypeModel.findOne({});
            let result = {};
            // ==============================
            // 🔹 CASE 1: API Search Mode
            // ==============================
            if ((searchType === null || searchType === void 0 ? void 0 : searchType.type) === 'API') {
                console.log('🔍 Performing API-based search...');
                // single-country (or default) search
                const ct = country || 'US';
                const [ebay] = yield Promise.all([
                    // getCheapestAmazonProducts(query, 5, ct),
                    (0, util_1.getTopCheapestProductsFromEbay)(query, 5, ct),
                ]);
                result = { ebay };
            }
            // amazon + ebay combined search (multi-country) - DISABLED FOR NOW
            //   const [amazon, ebay] = await Promise.all([
            //     getCheapestAmazonProducts(query, 5, ct),
            //     getTopCheapestProductsFromEbay(query, 5, ct),
            //   ]);
            //   result = { amazon, ebay };
            // }
            // ==============================
            // 🔹 CASE 2: GENERIC Search Mode
            // ==============================
            else if ((searchType === null || searchType === void 0 ? void 0 : searchType.type) === 'GENERIC') {
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
                const genericResults = yield Promise.all(sites.map(site => (0, affiliate_service_1.genericSearch)(site, query)));
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
        }
        catch (err) {
            console.error('❌ Error fetching products:', err);
            res.status(500).json({
                success: false,
                error: ((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message,
            });
        }
    });
}
exports.getSingleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { source } = req.query;
    // const result = await getSingleAmazonProduct(id);
    console.log({ id, source });
    let result;
    if (source === 'ebay') {
        result = yield (0, util_1.getSingleProductFromEbay)(id);
    }
    else if (source === 'amazon') {
        result = yield (0, util_1.getSingleAmazonProduct)(id);
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: `Product retrieved successfully from ${source}`,
        data: result,
    });
}));
const createSearchType = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const marketplaceData = req.body;
    const result = yield marketplace_service_1.MarketplaceServices.createSearchType(user, marketplaceData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'SearchType created successfully',
        data: result,
    });
}));
const getSearchType = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // const marketplaceData = req.body;
    const result = yield marketplace_service_1.MarketplaceServices.getSearchType(user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'SearchType data retrieved successfully',
        data: result,
    });
}));
exports.MarketplaceController = {
    updateMarketplace,
    getSingleProduct: exports.getSingleProduct,
    deleteMarketplace,
    searchProduct,
    createSearchType,
    getSearchType,
};
