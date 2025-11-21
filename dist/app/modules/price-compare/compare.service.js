"use strict";
// src/modules/priceComparison/priceComparison.service.ts
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
exports.comparePrices = void 0;
// import { scrapeAmazon } from './scrapers/amazon';
const ebay_1 = require("./scrapers/ebay");
// Helper function to safely run scrapers with timeout
const runScraperSafely = (fn, name, timeout) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield Promise.race([
            fn(),
            new Promise(resolve => setTimeout(() => {
                resolve(null);
            }, timeout)),
        ]);
    }
    catch (error) {
        return null;
    }
});
// Generic link generators
const buildGenericLinks = (product) => {
    const encoded = encodeURIComponent(product);
    return [
        { source: "Amazon", link: `https://www.amazon.it/s?k=${encoded}` },
        { source: "AliExpress", link: `https://www.aliexpress.com/wholesale?SearchText=${encoded}` },
        { source: "Temu", link: `https://www.temu.com/search_result.html?search_key=${encoded}` },
        { source: "Subito", link: `https://www.subito.it/annunci-italia/vendita/usato/?q=${encoded}` },
        { source: "Zalando", link: `https://www.zalando.it/catalogo/?q=${encoded}` },
        { source: "Alibaba", link: `https://www.alibaba.com/trade/search?SearchText=${encoded}` },
        { source: "ePrice", link: `https://www.eprice.it/search/${encoded}` },
        { source: "Mediaworld", link: `https://www.mediaworld.it/search/${encoded}` },
        { source: "Carrefour", link: `https://www.carrefour.it/search?q=${encoded}` },
        { source: "Unieuro", link: `https://www.unieuro.it/online/search?text=${encoded}` },
    ];
};
const comparePrices = (product, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const SCRAPER_TIMEOUT = 120000;
    const scrapers = [
        { name: 'eBay', fn: () => (0, ebay_1.scrapeEbay)(product, maxPrice) },
    ];
    // Run scrapers sequentially
    const results = [];
    for (const scraper of scrapers) {
        const result = yield runScraperSafely(scraper.fn, scraper.name, SCRAPER_TIMEOUT);
        results.push(result);
    }
    const grouped = [];
    // Process results
    results.forEach(result => {
        if (result === null)
            return;
        let items = Array.isArray(result)
            ? result
            : result
                ? [result]
                : [];
        items = items
            .filter(item => item.price <= maxPrice)
            .map(item => (Object.assign(Object.assign({}, item), { price: parseFloat(item.price.toFixed(2)) })));
        if (items.length === 0)
            return;
        // Group by source and take top 3 cheapest
        const sources = [...new Set(items.map(item => item.source))];
        for (const source of sources) {
            const sourceItems = items.filter(item => item.source === source);
            const top3 = sourceItems.sort((a, b) => a.price - b.price).slice(0, 3);
            if (top3.length > 0) {
                grouped.push({ source, results: top3 });
            }
        }
    });
    // Always prepare generic links
    const genericLinks = buildGenericLinks(product);
    if (grouped.length === 0) {
        return {
            found: false,
            message: 'No products found below the given price.',
            generic: genericLinks,
        };
    }
    // Sort groups by lowest price in group
    grouped.sort((a, b) => Math.min(...a.results.map(r => r.price)) -
        Math.min(...b.results.map(r => r.price)));
    return {
        found: true,
        data: grouped,
        generic: genericLinks,
    };
});
exports.comparePrices = comparePrices;
