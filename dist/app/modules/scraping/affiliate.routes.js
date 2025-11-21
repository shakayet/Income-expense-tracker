"use strict";
// src/routes/affiliate.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scraping = void 0;
const express_1 = require("express");
const affiliate_controller_1 = require("./affiliate.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
const affiliateController = new affiliate_controller_1.AffiliateController();
router.post('/credentials', (0, auth_1.default)('SUPER_ADMIN', 'ADMIN'), affiliateController.setCredentials);
router.patch('/credentials', (0, auth_1.default)('SUPER_ADMIN', 'ADMIN'), affiliateController.setCredentials);
router.post('/credentials/test', (0, auth_1.default)('SUPER_ADMIN', 'ADMIN'), affiliateController.testCredentials);
router.get('/search', affiliateController.searchProducts);
exports.Scraping = router;
