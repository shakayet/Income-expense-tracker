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
exports.InAppPurchaseController = exports.deletePurchase = exports.getSinglePurchase = exports.getAllPurchases = exports.createPurchase = void 0;
exports.checkPremiumStatus = checkPremiumStatus;
exports.getUserPurchaseHistory = getUserPurchaseHistory;
exports.getAdminUserPurchaseHistory = getAdminUserPurchaseHistory;
const inapp_service_1 = require("./inapp.service");
const mongoose_1 = require("mongoose");
// Helper to normalize user id from auth middleware; support either `id` or `_id`
function getUserId(req) {
    var _a;
    const user = req
        .user;
    return (_a = user === null || user === void 0 ? void 0 : user.id) !== null && _a !== void 0 ? _a : user === null || user === void 0 ? void 0 : user._id;
}
const createPurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserId(req);
    if (!userId)
        return res
            .status(401)
            .json({ success: false, message: 'User not authenticated' });
    const payload = Object.assign(Object.assign({}, req.body), { user: new mongoose_1.Types.ObjectId(userId), purchaseDate: new Date() });
    const result = yield (0, inapp_service_1.createPurchaseInDB)(payload, userId);
    res.status(201).json({
        success: true,
        message: 'In-app purchase recorded successfully',
        data: result,
    });
});
exports.createPurchase = createPurchase;
const getAllPurchases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserId(req);
    if (!userId)
        return res
            .status(401)
            .json({ success: false, message: 'User not authenticated' });
    const result = yield (0, inapp_service_1.getAllPurchasesFromDB)(userId);
    res.status(200).json({
        success: true,
        message: 'User purchases retrieved successfully',
        data: result,
    });
});
exports.getAllPurchases = getAllPurchases;
const getSinglePurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId)
        return res
            .status(401)
            .json({ success: false, message: 'User not authenticated' });
    const result = yield (0, inapp_service_1.getSinglePurchaseFromDB)(id, userId);
    res.status(200).json({
        success: true,
        message: 'Purchase retrieved successfully',
        data: result,
    });
});
exports.getSinglePurchase = getSinglePurchase;
const deletePurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId)
        return res
            .status(401)
            .json({ success: false, message: 'User not authenticated' });
    const result = yield (0, inapp_service_1.deletePurchaseFromDB)(id, userId);
    res.status(200).json({
        success: true,
        message: 'Purchase deleted successfully',
        data: result,
    });
});
exports.deletePurchase = deletePurchase;
function checkPremiumStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = getUserId(req);
            if (!userId)
                return res
                    .status(401)
                    .json({ success: false, message: 'User not authenticated' });
            const premiumStatus = yield (0, inapp_service_1.checkPremiumStatus)(userId);
            res.status(200).json({ success: true, data: premiumStatus });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error checking premium status',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
}
function getUserPurchaseHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = getUserId(req);
            if (!userId)
                return res
                    .status(401)
                    .json({ success: false, message: 'User not authenticated' });
            const purchases = yield (0, inapp_service_1.getUserPurchases)(userId);
            res.status(200).json({ success: true, data: purchases });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching purchase history',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
}
/**
 * Admin/Super Admin endpoint to view purchase history for a specific user.
 * Route: GET /admin/users/:userId/purchase-history
 * Auth: ADMIN, SUPER_ADMIN
 */
function getAdminUserPurchaseHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            if (!userId)
                return res
                    .status(400)
                    .json({ success: false, message: 'userId is required' });
            const purchases = yield (0, inapp_service_1.getAnyUserPurchaseHistoryForAdmin)(userId);
            res.status(200).json({
                success: true,
                message: `Purchase history for user ${userId}`,
                data: purchases,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user purchase history',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
}
exports.InAppPurchaseController = {
    createPurchase: exports.createPurchase,
    getAllPurchases: exports.getAllPurchases,
    getSinglePurchase: exports.getSinglePurchase,
    deletePurchase: exports.deletePurchase,
    checkPremiumStatus,
    getUserPurchaseHistory,
    getAdminUserPurchaseHistory,
};
