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
exports.recentTransactions = void 0;
const recentTransaction_service_1 = require("./recentTransaction.service");
const recentTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const data = yield (0, recentTransaction_service_1.getRecentTransactions)(userId, Number(page), Number(limit));
        res.json({
            success: true,
            message: 'Recent transactions fetched successfully',
            data,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        res.status(500).json({
            success: false,
            message,
        });
    }
});
exports.recentTransactions = recentTransactions;
