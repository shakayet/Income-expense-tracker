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
exports.getSingleAmazonProduct = exports.getCheapestAmazonProducts = exports.getAmazonProduct = void 0;
exports.getTopCheapestProductsFromEbay = getTopCheapestProductsFromEbay;
exports.getSingleProductFromEbay = getSingleProductFromEbay;
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config"));
const API_KEY = 'aad814019bmshd45653f0c24a087p11edf7jsn76826ab14238';
const getAmazonProduct = (asin) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield axios_1.default.get('https://real-time-amazon-data.p.rapidapi.com/product', {
        params: { asin, country: 'US' },
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
        },
    });
    const p = res.data.data;
    return {
        title: p.product_title,
        price: parseFloat(p.product_price.replace('$', '')), // Remove dollar sign
        image: p.product_photo,
        rating: parseFloat(p.product_star_rating),
        url: p.product_url,
    };
});
exports.getAmazonProduct = getAmazonProduct;
const getCheapestAmazonProducts = (query_1, ...args_1) => __awaiter(void 0, [query_1, ...args_1], void 0, function* (query, top = 5) {
    const res = yield axios_1.default.get('https://real-time-amazon-data.p.rapidapi.com/search', {
        params: { query, limit: 20, country: 'US' },
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
        },
    });
    const products = res.data.data.products
        .filter((p) => {
        // Check if product_price exists and is not null/undefined
        return (p.product_price && p.product_price !== '$' && p.product_price !== '');
    })
        .sort((a, b) => {
        // Remove dollar signs and convert to numbers for sorting
        const priceA = parseFloat(a.product_price.replace('$', ''));
        const priceB = parseFloat(b.product_price.replace('$', ''));
        return priceA - priceB;
    })
        .slice(0, top);
    return products.map((p) => ({
        itemId: p.asin,
        title: p.product_title,
        price: parseFloat(p.product_price.replace('$', '')), // Remove dollar sign
        image: p.product_photo,
        rating: parseFloat(p.product_star_rating),
        url: p.product_url,
    }));
});
exports.getCheapestAmazonProducts = getCheapestAmazonProducts;
const getSingleAmazonProduct = (asin) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        // Use search endpoint as fallback
        const res = yield axios_1.default.get('https://real-time-amazon-data.p.rapidapi.com/search', {
            params: { query: asin, limit: 1, country: 'US' },
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
            },
        });
        const product = (_c = (_b = (_a = res.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.products) === null || _c === void 0 ? void 0 : _c[0];
        if (!product)
            return null;
        return {
            title: product.product_title,
            price: parseFloat(product.product_price.replace('$', '')) || 0,
            image: product.product_photo || 'https://via.placeholder.com/150',
            rating: parseFloat(product.product_star_rating) || 0,
            url: product.product_url || '#',
        };
    }
    catch (err) {
        console.error('Error fetching Amazon product:', ((_d = err.response) === null || _d === void 0 ? void 0 : _d.data) || err.message);
        return null;
    }
});
exports.getSingleAmazonProduct = getSingleAmazonProduct;
// it's for ebay. perfect working
const OAUTH_URL = 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
function getAppAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const creds = Buffer.from(`${config_1.default.ebay.client_id}:${config_1.default.ebay.client_secret}`).toString('base64');
        try {
            const res = yield axios_1.default.post(OAUTH_URL, 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${creds}`,
                },
            });
            return res.data.access_token;
        }
        catch (err) {
            console.error('Error fetching eBay access token:', ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            throw new Error('Failed to get eBay access token');
        }
    });
}
function searchProducts(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, limit = 10) {
        var _a;
        const token = yield getAppAccessToken();
        console.log({ token });
        const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=${limit}`;
        try {
            const res = yield axios_1.default.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log({ res: res });
            return res.data;
        }
        catch (err) {
            console.error('Error fetching eBay products:', ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            return { itemSummaries: [] };
        }
    });
}
function getTopCheapestProductsFromEbay(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, top = 5) {
        const data = yield searchProducts(query, 50); // your search API
        console.log({ data: data.itemSummaries });
        const token = yield getAppAccessToken();
        if (!data.itemSummaries || data.itemSummaries.length === 0)
            return [];
        // Filter items with a valid price
        const itemsWithPrice = data.itemSummaries.filter((item) => { var _a; return (_a = item.price) === null || _a === void 0 ? void 0 : _a.value; });
        if (itemsWithPrice.length === 0)
            return [];
        // Sort by price
        const sortedItems = itemsWithPrice.sort((a, b) => parseFloat(a.price.value) - parseFloat(b.price.value));
        // Take top N items
        const topItems = sortedItems.slice(0, top);
        // Fetch images for each item (fallback to placeholder if none)
        const products = yield Promise.all(topItems.map((item) => __awaiter(this, void 0, void 0, function* () {
            const fullItem = yield getSingleProductFromEbay(item.itemId);
            return fullItem
                ? {
                    itemId: item.itemId,
                    title: fullItem.title,
                    price: fullItem.price,
                    image: fullItem.image,
                    rating: fullItem.rating,
                    url: fullItem.url,
                }
                : {
                    itemId: item.itemId,
                    title: item.title,
                    price: parseFloat(item.price.value),
                    image: 'https://via.placeholder.com/150',
                    rating: 0,
                    url: item.itemWebUrl || '#',
                };
        })));
        console.log({ products });
        return products;
    });
}
function getSingleProductFromEbay(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const token = yield getAppAccessToken();
        // Construct the API URL
        const url = `https://api.sandbox.ebay.com/buy/browse/v1/item/${encodeURIComponent(itemId)}`;
        try {
            const res = yield axios_1.default.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const item = res.data;
            // Format result similar to getTopCheapestProducts
            return {
                title: item.title || 'No title',
                price: parseFloat(((_a = item.price) === null || _a === void 0 ? void 0 : _a.value) || 0),
                currency: ((_b = item.price) === null || _b === void 0 ? void 0 : _b.currency) || 'USD',
                image: ((_c = item.image) === null || _c === void 0 ? void 0 : _c.imageUrl) || 'https://via.placeholder.com/150',
                rating: (_e = (_d = item.reviews) === null || _d === void 0 ? void 0 : _d.averageRating) !== null && _e !== void 0 ? _e : 0,
                seller: ((_f = item.seller) === null || _f === void 0 ? void 0 : _f.username) || 'Unknown seller',
                condition: item.condition || 'Unknown',
                url: item.itemWebUrl || '#',
                description: item.shortDescription || 'No description available.',
            };
        }
        catch (err) {
            console.error('Error fetching single eBay product:', ((_g = err.response) === null || _g === void 0 ? void 0 : _g.data) || err.message);
            return null;
        }
    });
}
