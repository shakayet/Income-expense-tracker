"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.scrapeStore = void 0;
// src/utils/scraperUtils.ts
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const scrapeStore = (productName, maxPrice, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchUrl = options.url.replace('{product}', encodeURIComponent(productName));
        const userAgent = options.userAgent ||
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';
        const { data } = yield axios_1.default.get(searchUrl, {
            headers: { 'User-Agent': userAgent },
        });
        const $ = cheerio.load(data);
        const results = [];
        $(options.containerSelector).each((_, el) => {
            const title = $(el).find(options.titleSelector).text().trim();
            const priceText = $(el)
                .find(options.priceSelector)
                .text()
                .trim()
                .replace(',', '.')
                .replace(/[^\d.]/g, '');
            const price = parseFloat(priceText);
            let link = $(el).find(options.linkSelector).attr('href') || '';
            if (link && !link.startsWith('http')) {
                link = options.linkPrefix ? `${options.linkPrefix}${link}` : link;
            }
            if (title && !isNaN(price)) {
                results.push({ title, price, link, source: options.source });
            }
        });
        return results
            .filter(p => p.price <= maxPrice)
            .sort((a, b) => a.price - b.price)
            .slice(0, 3);
    }
    catch (error) {
        return [];
    }
});
exports.scrapeStore = scrapeStore;
