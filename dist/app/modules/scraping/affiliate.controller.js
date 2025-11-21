"use strict";
// src/controllers/affiliate.controller.ts
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
exports.AffiliateController = void 0;
const affiliate_service_1 = require("./affiliate.service");
const affiliateService = new affiliate_service_1.AffiliateService();
class AffiliateController {
    setCredentials(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCreds = req.body;
            if (!newCreds || Object.keys(newCreds).length === 0) {
                res.status(400).json({ error: 'Request body must contain credentials.' });
                return;
            }
            affiliateService.setCredentials(newCreds);
            res.status(200).json({ message: 'Credentials updated successfully.' });
        });
    }
    testCredentials(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const credsToTest = req.body;
            if (!credsToTest || Object.keys(credsToTest).length === 0) {
                res.status(400).json({ error: 'Request body must contain credentials to test.' });
                return;
            }
            const isValid = yield affiliateService.testCredentials(credsToTest);
            if (isValid) {
                res.status(200).json({ message: 'Credentials are valid.' });
            }
            else {
                res.status(401).json({ error: 'Credentials are invalid or unauthorized.' });
            }
        });
    }
    searchProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, maxPrice } = req.query;
            const searchQuery = query;
            const priceLimit = parseFloat(maxPrice);
            if (!searchQuery || isNaN(priceLimit) || priceLimit <= 0) {
                res.status(400).json({ error: 'Invalid query or maxPrice' });
                return;
            }
            try {
                const products = yield affiliateService.searchProducts(searchQuery, priceLimit);
                res.json(products);
            }
            catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}
exports.AffiliateController = AffiliateController;
