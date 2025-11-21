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
exports.scrapeEbay = void 0;
const puppeteerHelper_1 = require("../puppeteerHelper");
const scrapeEbay = (query, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    let browser;
    try {
        browser = yield (0, puppeteerHelper_1.launchBrowser)();
        const page = yield browser.newPage();
        // Configure browser to mimic human behavior
        yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        yield page.setViewport({ width: 1280, height: 800 });
        yield page.setExtraHTTPHeaders({
            'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        });
        // Navigate with optimized parameters
        yield page.goto(`https://www.ebay.it/sch/i.html?_nkw=${encodeURIComponent(query)}&_ipg=120`, {
            waitUntil: 'networkidle2',
            timeout: 60000,
        });
        // Wait for core content
        yield page.waitForSelector('.s-item', { timeout: 45000 });
        const results = yield page.evaluate((maxPrice) => {
            return Array.from(document.querySelectorAll('.s-item'))
                .slice(1) // Skip first item (usually header)
                .map(item => {
                var _a;
                try {
                    const priceEl = item.querySelector('.s-item__price');
                    const linkEl = item.querySelector('.s-item__link');
                    const titleEl = item.querySelector('.s-item__title');
                    const href = linkEl === null || linkEl === void 0 ? void 0 : linkEl.getAttribute('href');
                    const title = ((_a = titleEl === null || titleEl === void 0 ? void 0 : titleEl.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                    if (!(priceEl === null || priceEl === void 0 ? void 0 : priceEl.textContent) || !href || !title)
                        return null;
                    // Extract and clean price
                    let priceText = priceEl.textContent.trim();
                    // Handle price ranges
                    if (priceText.includes(' a ') || priceText.includes(' to ')) {
                        priceText = priceText.split(/ a | to /i)[0].trim();
                    }
                    // Normalize currency format
                    const cleanPrice = priceText
                        .replace(/[^\d,.]/g, '') // Remove non-numeric chars
                        .replace(/\./g, '') // Remove thousands separators
                        .replace(/,/g, '.'); // Convert decimal commas to dots
                    const price = parseFloat(cleanPrice);
                    if (isNaN(price))
                        return null;
                    // Filter within evaluation to reduce memory
                    if (price > maxPrice)
                        return null;
                    return {
                        price,
                        link: href,
                        source: 'eBay',
                        title,
                    };
                }
                catch (e) {
                    return null;
                }
            })
                .filter((item) => Boolean(item));
        }, maxPrice);
        return results;
    }
    catch (_a) {
        return [];
    }
    finally {
        if (browser)
            yield browser.close();
    }
});
exports.scrapeEbay = scrapeEbay;
