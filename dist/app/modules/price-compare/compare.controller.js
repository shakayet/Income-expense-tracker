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
exports.getCostCompareHistory = exports.addCostCompare = exports.comparePriceController = void 0;
const compare_service_1 = require("./compare.service");
const compare_model_1 = __importDefault(require("./compare.model"));
const comparePriceController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product, maxPrice } = req.body;
    if (!product || !maxPrice)
        return res.status(400).json({ message: 'Missing product or maxPrice' });
    const result = yield (0, compare_service_1.comparePrices)(product, maxPrice);
    res.json(result);
});
exports.comparePriceController = comparePriceController;
const addCostCompare = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { initialPrice, finalPrice, costType } = req.body;
        const savedAmount = initialPrice - finalPrice;
        const data = yield compare_model_1.default.create({
            user: req.user.id,
            initialPrice,
            finalPrice,
            savedAmount,
            costType,
        });
        res.status(201).json({
            success: true,
            message: 'Cost comparison added successfully',
            data,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.addCostCompare = addCostCompare;
const getCostCompareHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const data = yield compare_model_1.default.find({ user: req.user.id }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            message: 'Fetched cost compare history',
            data,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getCostCompareHistory = getCostCompareHistory;
