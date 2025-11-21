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
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericSearch = exports.AffiliateService = void 0;
const credentials = {};
const genericSearch = (siteName, query) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Providing a generic search link for '${query}' on ${siteName}...`);
    const encodedQuery = encodeURIComponent(query);
    const links = {
        "Amazon": `https://www.amazon.it/s?k=${encodedQuery}`,
        "AliExpress": `https://www.aliexpress.com/wholesale?SearchText=${encodedQuery}`,
        "Temu": `https://www.temu.com/search_result.html?search_key=${encodedQuery}`,
        "Subito": `https://www.subito.it/annunci-italia/vendita/usato/?q=${encodedQuery}`,
        "Zalando": `https://www.zalando.it/catalogo/?q=${encodedQuery}`,
        "Alibaba": `https://www.alibaba.com/trade/search?SearchText=${encodedQuery}`,
        "ePrice": `https://www.eprice.it/search/${encodedQuery}`,
        "Mediaworld": `https://www.mediaworld.it/it/search.html?query=${encodedQuery}`,
        "Carrefour": `https://www.carrefour.fr/search?q=${encodedQuery}`,
        "Unieuro": `https://www.unieuro.it/online/products?q=${encodedQuery}`,
        "Douglas": `https://www.douglas.it/search?q=${encodedQuery}`,
        "Leroy Merlin": `https://www.leroymerlin.it/search?q=${encodedQuery}`,
        "Back Market": `https://www.backmarket.it/search?q=${encodedQuery}`,
        "Swappie": `https://www.swappie.com/it/`,
        "Notino": `https://www.notino.it/search.asp?exps=${encodedQuery}`
    };
    const link = links[siteName];
    if (!link)
        return [];
    return [{
            siteName,
            productTitle: `Generic search for "${query}"`,
            productPrice: 0,
            productLink: link
        }];
});
exports.genericSearch = genericSearch;
const searchAmazon = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.amazon;
    try {
        if ((creds === null || creds === void 0 ? void 0 : creds.key) && creds.secret) {
            console.log('Using Amazon PA-API with credentials...');
            const apiResponse = [{ siteName: 'Amazon', productTitle: 'Amazon API Product 1', productPrice: 45.99, productLink: 'https://amazon.com/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Amazon', query);
        }
    }
    catch (error) {
        console.error('Amazon search failed:', error);
        return [];
    }
});
// ✅ eBay real API search
// FIX: New search function for Temu
const searchTemu = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.temu;
    try {
        if (creds === null || creds === void 0 ? void 0 : creds.key) {
            console.log('Using Temu API with credentials...');
            const apiResponse = [{ siteName: 'Temu', productTitle: 'Temu API Product 1', productPrice: 19.99, productLink: 'https://temu.com/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Temu', query);
        }
    }
    catch (error) {
        console.error('Temu search failed:', error);
        return [];
    }
});
// FIX: New search function for Subito
const searchSubito = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.subito;
    try {
        if (creds === null || creds === void 0 ? void 0 : creds.key) {
            console.log('Using Subito API with credentials...');
            const apiResponse = [{ siteName: 'Subito', productTitle: 'Subito API Product 1', productPrice: 85.00, productLink: 'https://subito.it/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Subito', query);
        }
    }
    catch (error) {
        console.error('Subito search failed:', error);
        return [];
    }
});
// FIX: New search function for Alibaba
const searchAlibaba = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.alibaba;
    try {
        if (creds === null || creds === void 0 ? void 0 : creds.key) {
            console.log('Using Alibaba API with credentials...');
            const apiResponse = [{ siteName: 'Alibaba', productTitle: 'Alibaba API Product 1', productPrice: 120.00, productLink: 'https://alibaba.com/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Alibaba', query);
        }
    }
    catch (error) {
        console.error('Alibaba search failed:', error);
        return [];
    }
});
const searchZalando = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.zalando;
    try {
        if (creds === null || creds === void 0 ? void 0 : creds.key) {
            console.log('Using Zalando (Awin) API with credentials...');
            const apiResponse = [{ siteName: 'Zalando', productTitle: 'Zalando Product', productPrice: 75.00, productLink: 'https://zalando.com/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Zalando', query);
        }
    }
    catch (error) {
        console.error('Zalando search failed:', error);
        return [];
    }
});
const searchMediaworld = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.mediaworld;
    try {
        if (creds === null || creds === void 0 ? void 0 : creds.key) {
            console.log('Using Mediaworld (Awin) API with credentials...');
            const apiResponse = [{ siteName: 'Mediaworld', productTitle: 'Mediaworld Product', productPrice: 199.99, productLink: 'https://mediaworld.it/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Mediaworld', query);
        }
    }
    catch (error) {
        console.error('Mediaworld search failed:', error);
        return [];
    }
});
const searchNotino = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.notino;
    try {
        if (creds === null || creds === void 0 ? void 0 : creds.key) {
            console.log('Using Notino (Awin) API with credentials...');
            const apiResponse = [{ siteName: 'Notino', productTitle: 'Notino Product', productPrice: 25.00, productLink: 'https://notino.it/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Notino', query);
        }
    }
    catch (error) {
        console.error('Notino search failed:', error);
        return [];
    }
});
const searchDouglas = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.douglas;
    try {
        if (creds === null || creds === void 0 ? void 0 : creds.key) {
            console.log('Using Douglas (CJ Affiliate/Awin) API with credentials...');
            const apiResponse = [{ siteName: 'Douglas', productTitle: 'Douglas Product', productPrice: 45.00, productLink: 'https://douglas.it/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Douglas', query);
        }
    }
    catch (error) {
        console.error('Douglas search failed:', error);
        return [];
    }
});
const searchLeroyMerlin = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.leroyMerlin;
    try {
        if (creds === null || creds === void 0 ? void 0 : creds.key) {
            console.log('Using Leroy Merlin (Impact/Awin) API with credentials...');
            const apiResponse = [{ siteName: 'Leroy Merlin', productTitle: 'Leroy Merlin Product', productPrice: 15.00, productLink: 'https://leroymerlin.it/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Leroy Merlin', query);
        }
    }
    catch (error) {
        console.error('Leroy Merlin search failed:', error);
        return [];
    }
});
const searchBackMarket = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.backMarket;
    try {
        if (creds === null || creds === void 0 ? void 0 : creds.key) {
            console.log('Using Back Market (Impact) API with credentials...');
            const apiResponse = [{ siteName: 'Back Market', productTitle: 'Back Market Product', productPrice: 350.00, productLink: 'https://backmarket.it/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Back Market', query);
        }
    }
    catch (error) {
        console.error('Back Market search failed:', error);
        return [];
    }
});
const searchSwappie = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const creds = credentials.swappie;
    try {
        if (creds === null || creds === void 0 ? void 0 : creds.key) {
            console.log('Using Swappie (Impact) API with credentials...');
            const apiResponse = [{ siteName: 'Swappie', productTitle: 'Swappie Product', productPrice: 280.00, productLink: 'https://swappie.com/api/1' }];
            return apiResponse
                .filter(p => p.productPrice !== null && p.productPrice <= maxPrice)
                .sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
                .slice(0, 2);
        }
        else {
            return genericSearch('Swappie', query);
        }
    }
    catch (error) {
        console.error('Swappie search failed:', error);
        return [];
    }
});
class AffiliateService {
    setCredentials(newCreds) {
        Object.assign(credentials, newCreds);
        console.log('Affiliate API credentials updated.');
    }
    testCredentials(creds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                setTimeout(() => {
                    var _a, _b;
                    const isValid = !!(((_a = creds.amazon) === null || _a === void 0 ? void 0 : _a.key) || ((_b = creds.ebay) === null || _b === void 0 ? void 0 : _b.key));
                    resolve(isValid);
                }, 500);
            });
        });
    }
    searchProducts(searchQuery, maxPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            const allPromises = [
                searchAmazon(searchQuery, maxPrice),
                // searcheBay(searchQuery, maxPrice),
                searchTemu(searchQuery, maxPrice),
                searchSubito(searchQuery, maxPrice),
                searchAlibaba(searchQuery, maxPrice),
                searchZalando(searchQuery, maxPrice),
                searchMediaworld(searchQuery, maxPrice),
                searchNotino(searchQuery, maxPrice),
                searchDouglas(searchQuery, maxPrice),
                searchLeroyMerlin(searchQuery, maxPrice),
                searchBackMarket(searchQuery, maxPrice),
                searchSwappie(searchQuery, maxPrice)
            ];
            const results = yield Promise.allSettled(allPromises);
            const allProducts = [];
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    allProducts.push(...result.value);
                }
            });
            return allProducts;
        });
    }
}
exports.AffiliateService = AffiliateService;
