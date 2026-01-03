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
exports.formatPrice = formatPrice;
exports.getTopCheapestProductsFromEbay = getTopCheapestProductsFromEbay;
exports.getSingleProductFromEbay = getSingleProductFromEbay;
exports.comparePricesAcrossCountries = comparePricesAcrossCountries;
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config"));
const marketplacecredential_model_1 = require("../marketplacecredential/marketplacecredential.model");
// const API_KEY = 'aad814019bmshd45653f0c24a087p11edf7jsn76826ab14238';
const getRepidApiKey = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield marketplacecredential_model_1.Marketplacecredential.findOne({
        marketplaceName: 'amazon',
        environment: 'production',
    })
        .sort({ _id: -1 }) // descending = latest first
        .lean();
    console.log({ data });
    return (data === null || data === void 0 ? void 0 : data.api_key) || '';
});
const countryToLocale = {
    US: 'en-US',
    GB: 'en-GB',
    DE: 'de-DE',
    FR: 'fr-FR',
    IN: 'en-IN',
    IT: 'it-IT',
    AU: 'en-AU',
};
function formatPrice(value, currency, country) {
    const locale = country
        ? countryToLocale[country.toUpperCase()] || 'en-US'
        : 'en-US';
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
        }).format(value);
    }
    catch (_a) {
        return `${currency} ${value.toFixed(2)}`;
    }
}
const countryToCurrency = {
    US: 'USD',
    GB: 'GBP',
    DE: 'EUR',
    FR: 'EUR',
    IT: 'EUR',
    IN: 'INR',
    AU: 'AUD',
};
const countryToEbayMarketplace = {
    // Use underscore variant which the Buy API expects in many cases
    US: 'EBAY_US',
    GB: 'EBAY_GB',
    DE: 'EBAY_DE',
    FR: 'EBAY_FR',
    IT: 'EBAY_IT',
    IN: 'EBAY_IN',
    AU: 'EBAY_AU',
};
const getAmazonProduct = (asin) => __awaiter(void 0, void 0, void 0, function* () {
    const API_KEY = yield getRepidApiKey();
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
const getCheapestAmazonProducts = (query_1, ...args_1) => __awaiter(void 0, [query_1, ...args_1], void 0, function* (query, top = 5, country = 'US') {
    const API_KEY = yield getRepidApiKey();
    const res = yield axios_1.default.get('https://real-time-amazon-data.p.rapidapi.com/search', {
        params: { query, limit: 20, country },
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
    return products.map((p) => {
        const raw = p.product_price || '';
        const numeric = parseFloat(raw.replace(/[^0-9.,-]+/g, '').replace(',', '.')) || 0;
        const currency = countryToCurrency[country === null || country === void 0 ? void 0 : country.toUpperCase()] || 'USD';
        return {
            itemId: p.asin,
            title: p.product_title,
            price: numeric,
            currency,
            formattedPrice: formatPrice(numeric, currency, country),
            image: p.product_photo,
            rating: parseFloat(p.product_star_rating),
            url: p.product_url,
        };
    });
});
exports.getCheapestAmazonProducts = getCheapestAmazonProducts;
const getSingleAmazonProduct = (asin_1, ...args_1) => __awaiter(void 0, [asin_1, ...args_1], void 0, function* (asin, country = 'US') {
    var _a, _b, _c, _d;
    const API_KEY = yield getRepidApiKey();
    try {
        // Use search endpoint as fallback
        const res = yield axios_1.default.get('https://real-time-amazon-data.p.rapidapi.com/search', {
            params: { query: asin, limit: 1, country },
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
            },
        });
        const product = (_c = (_b = (_a = res.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.products) === null || _c === void 0 ? void 0 : _c[0];
        if (!product)
            return null;
        const raw = product.product_price || '';
        const numeric = parseFloat(raw.replace(/[^0-9.,-]+/g, '').replace(',', '.')) || 0;
        const currency = countryToCurrency[country === null || country === void 0 ? void 0 : country.toUpperCase()] || 'USD';
        return {
            title: product.product_title,
            price: numeric,
            currency,
            formattedPrice: formatPrice(numeric, currency, country),
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
// eBay OAuth endpoint
// use sandbox URL for sandbox environment if needed
const OAUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const ebayCredsCache = {};
const tokenCache = {};
function loadEbayCredentialsFromDB(country_1) {
    return __awaiter(this, arguments, void 0, function* (country, environment = 'production') {
        var _a, _b, _c, _d;
        const cacheKey = `${environment}:${country || 'all'}`;
        if (ebayCredsCache[cacheKey])
            return ebayCredsCache[cacheKey];
        const query = { marketplaceName: 'ebay', environment };
        if (country)
            query.country = country;
        // try with country first
        let doc = yield marketplacecredential_model_1.Marketplacecredential.findOne(query).lean();
        // fallback: if country-specific not found, try without country
        if (!doc && country) {
            doc = yield marketplacecredential_model_1.Marketplacecredential.findOne({
                marketplaceName: 'ebay',
                environment,
            }).lean();
        }
        // fallback to config values if DB not populated
        const cfgClientId = ((_a = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.ebay) === null || _a === void 0 ? void 0 : _a.client_id) || ((_b = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.ebay) === null || _b === void 0 ? void 0 : _b.clientId);
        const cfgClientSecret = ((_c = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.ebay) === null || _c === void 0 ? void 0 : _c.client_secret) || ((_d = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.ebay) === null || _d === void 0 ? void 0 : _d.clientSecret);
        if (!doc || !doc.clientId || !doc.clientSecret) {
            if (cfgClientId && cfgClientSecret) {
                ebayCredsCache[cacheKey] = {
                    clientId: cfgClientId,
                    clientSecret: cfgClientSecret,
                };
                return ebayCredsCache[cacheKey];
            }
            throw new Error('eBay credentials not found in DB or config');
        }
        ebayCredsCache[cacheKey] = {
            clientId: doc.clientId,
            clientSecret: doc.clientSecret,
        };
        return ebayCredsCache[cacheKey];
    });
}
function getAppAccessToken(country) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const { clientId, clientSecret } = yield loadEbayCredentialsFromDB(country);
        const cacheKey = clientId; // token cache per app
        const now = Date.now();
        const existing = tokenCache[cacheKey];
        if (existing && existing.expiresAt - now > 60000) {
            return existing.token;
        }
        const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const body = 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${creds}`,
        };
        const maxRetries = 2;
        let lastErr = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const res = yield axios_1.default.post(OAUTH_URL, body, { headers, timeout: 5000 });
                const token = res.data.access_token;
                const expiresIn = Number(res.data.expires_in) || 7200;
                tokenCache[cacheKey] = {
                    token,
                    expiresAt: Date.now() + expiresIn * 1000,
                };
                return token;
            }
            catch (err) {
                lastErr = err;
                const status = (_a = err.response) === null || _a === void 0 ? void 0 : _a.status;
                const data = (_b = err.response) === null || _b === void 0 ? void 0 : _b.data;
                console.error(`eBay token request failed (attempt ${attempt + 1})`, {
                    status,
                    data,
                    message: err.message,
                });
                if (attempt < maxRetries &&
                    (!status || (status >= 500 && status < 600))) {
                    const wait = 200 * Math.pow(2, attempt);
                    yield new Promise(r => setTimeout(r, wait));
                    continue;
                }
                break;
            }
        }
        throw new Error(`Failed to obtain eBay access token: ${((_d = (_c = lastErr === null || lastErr === void 0 ? void 0 : lastErr.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error_description) ||
            (lastErr === null || lastErr === void 0 ? void 0 : lastErr.message) ||
            'unknown'}`);
    });
}
function searchProducts(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, limit = 10, country = 'italy') {
        var _a, _b, _c, _d, _e;
        const token = yield getAppAccessToken(country);
        // const token = await getAppAccessToken(country);
        console.log({ token });
        const marketplaceId = countryToEbayMarketplace[country === null || country === void 0 ? void 0 : country.toUpperCase()];
        // log marketplaceId for debugging
        console.log({ country, marketplaceId });
        const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=${limit}${marketplaceId ? `&marketplace_id=${encodeURIComponent(marketplaceId)}` : ''}`;
        try {
            const headers = { Authorization: `Bearer ${token}` };
            if (marketplaceId)
                headers['X-EBAY-C-MARKETPLACE-ID'] = marketplaceId;
            const acceptLang = country
                ? countryToLocale[country.toUpperCase()]
                : undefined;
            if (acceptLang)
                headers['Accept-Language'] = acceptLang;
            const res = yield axios_1.default.get(url, { headers });
            // debug: log first item currency if available
            if ((_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.itemSummaries) === null || _b === void 0 ? void 0 : _b.length) {
                console.log('eBay search first item currency:', (_c = res.data.itemSummaries[0].price) === null || _c === void 0 ? void 0 : _c.currency);
                const expected = countryToCurrency[(country === null || country === void 0 ? void 0 : country.toUpperCase()) || 'US'];
                if (((_d = res.data.itemSummaries[0].price) === null || _d === void 0 ? void 0 : _d.currency) &&
                    expected &&
                    res.data.itemSummaries[0].price.currency !== expected) {
                    console.warn(`Currency mismatch: expected ${expected} but got ${res.data.itemSummaries[0].price.currency}`);
                }
            }
            // console.log({ res: res });
            return res.data;
        }
        catch (err) {
            console.error('Error fetching eBay products:', ((_e = err.response) === null || _e === void 0 ? void 0 : _e.data) || err.message);
            return { itemSummaries: [] };
        }
    });
}
function getTopCheapestProductsFromEbay(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, top = 5, country) {
        const data = yield searchProducts(query, 50, country); // your search API
        // console.log({ data: data.itemSummaries[0].price });
        const token = yield getAppAccessToken(country);
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
            var _a, _b;
            const fullItem = yield getSingleProductFromEbay(item.itemId, country);
            if (fullItem) {
                const price = fullItem.price;
                const currency = (_a = item.price) === null || _a === void 0 ? void 0 : _a.currency;
                return {
                    itemId: item.itemId,
                    title: fullItem.title,
                    price,
                    currency,
                    formattedPrice: formatPrice(price, currency, country),
                    image: fullItem.image,
                    rating: fullItem.rating,
                    url: fullItem.url,
                };
            }
            const fallbackPrice = parseFloat(item.price.value || '0');
            const fallbackCurrency = ((_b = item.price) === null || _b === void 0 ? void 0 : _b.currency) || 'USD';
            return {
                itemId: item.itemId,
                title: item.title,
                price: fallbackPrice,
                currency: fallbackCurrency,
                formattedPrice: formatPrice(fallbackPrice, fallbackCurrency, country),
                image: 'https://via.placeholder.com/150',
                rating: 0,
                url: item.itemWebUrl || '#',
            };
        })));
        // console.log({ products });
        return products;
    });
}
function getSingleProductFromEbay(itemId, country) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const token = yield getAppAccessToken(country);
        // Construct the API URL
        const marketplaceId = countryToEbayMarketplace[(country === null || country === void 0 ? void 0 : country.toUpperCase()) || ''];
        const url = `https://api.ebay.com/buy/browse/v1/item/${encodeURIComponent(itemId)}${marketplaceId ? `?marketplace_id=${encodeURIComponent(marketplaceId)}` : ''}`;
        console.log({ url });
        try {
            const res = yield axios_1.default.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const item = res.data;
            // Format result similar to getTopCheapestProducts
            const numericPrice = parseFloat(((_a = item.price) === null || _a === void 0 ? void 0 : _a.value) || 0);
            const currency = ((_b = item.price) === null || _b === void 0 ? void 0 : _b.currency) || 'USD';
            return {
                title: item.title || 'No title',
                price: numericPrice,
                currency,
                formattedPrice: formatPrice(numericPrice, currency, country),
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
function comparePricesAcrossCountries(query_1, countries_1) {
    return __awaiter(this, arguments, void 0, function* (query, countries, top = 5) {
        const promises = countries.map((country) => __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield getTopCheapestProductsFromEbay(query, top, country);
                return { country, products };
            }
            catch (err) {
                console.error(`comparePricesAcrossCountries error for ${country}:`, (err === null || err === void 0 ? void 0 : err.message) || err);
                return { country, products: [] };
            }
        }));
        const results = yield Promise.all(promises);
        const map = {};
        results.forEach(r => {
            map[r.country] = r.products || [];
        });
        return map;
    });
}
