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
exports.deletePurchaseFromDB = exports.getSinglePurchaseFromDB = exports.getAllPurchasesFromDB = exports.createPurchaseInDB = void 0;
exports.checkPremiumStatus = checkPremiumStatus;
exports.isSubscriptionValid = isSubscriptionValid;
exports.calculateDaysLeft = calculateDaysLeft;
exports.getUserPurchases = getUserPurchases;
exports.getAnyUserPurchaseHistoryForAdmin = getAnyUserPurchaseHistoryForAdmin;
const inapp_model_1 = require("./inapp.model");
const mongoose_1 = require("mongoose");
const user_model_1 = require("../user/user.model");
const createPurchaseInDB = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if a purchase with the same transactionId already exists
        const existingPurchase = yield inapp_model_1.InAppPurchase.findOne({
            transactionId: payload.transactionId,
        });
        if (existingPurchase) {
            // If the purchase already exists, return it instead of creating a new one
            console.log(`Duplicate transaction detected: ${payload.transactionId}`);
            return `Duplicate transaction detected: ${payload.transactionId}`;
        }
        // Create a new purchase record
        const result = yield inapp_model_1.InAppPurchase.create(payload);
        // Update the user's currentSubscription and userType
        yield user_model_1.User.findByIdAndUpdate(userId, { currentSubscription: result._id, userType: 'pro' }, { new: true });
        // Return the newly created purchase record
        return result;
    }
    catch (error) {
        console.error('Error in creating purchase:', error);
        throw new Error('Failed to create purchase'); // You can throw or handle this error further
    }
});
exports.createPurchaseInDB = createPurchaseInDB;
const getAllPurchasesFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inapp_model_1.InAppPurchase.find({ user: userId }).populate('user');
    return result;
});
exports.getAllPurchasesFromDB = getAllPurchasesFromDB;
const getSinglePurchaseFromDB = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inapp_model_1.InAppPurchase.findOne({
        _id: id,
        user: userId,
    }).populate('user');
    return result;
});
exports.getSinglePurchaseFromDB = getSinglePurchaseFromDB;
const deletePurchaseFromDB = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inapp_model_1.InAppPurchase.findOneAndDelete({
        _id: id,
        user: userId,
    });
    return result;
});
exports.deletePurchaseFromDB = deletePurchaseFromDB;
function checkPremiumStatus(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const latestPurchase = yield inapp_model_1.InAppPurchase.findOne({
                user: new mongoose_1.Types.ObjectId(userId),
                productId: {
                    $in: [
                        'com.mashiur.expenseapp.yearly',
                        'com.mashiur.expenseapp.monthly',
                    ],
                },
            })
                .sort({ purchaseDate: -1 })
                .lean();
            if (!latestPurchase) {
                yield user_model_1.User.findByIdAndUpdate(userId, {
                    userType: 'free',
                    currentSubscription: null,
                }, { new: true });
                return { isPremium: false };
            }
            const isValid = isSubscriptionValid(latestPurchase);
            if (!isValid) {
                yield user_model_1.User.findByIdAndUpdate(userId, {
                    userType: 'free',
                    currentSubscription: null,
                }, { new: true });
                return { isPremium: false };
            }
            const daysLeft = calculateDaysLeft(latestPurchase);
            yield user_model_1.User.findByIdAndUpdate(userId, {
                userType: 'pro',
                currentSubscription: latestPurchase._id,
            }, { new: true });
            return { isPremium: true, daysLeft };
        }
        catch (error) {
            throw new Error(`Error checking premium status: ${error}`);
        }
    });
}
function isSubscriptionValid(purchase) {
    const now = new Date();
    const purchaseDate = new Date(purchase.purchaseDate);
    let subscriptionDays = 0;
    if (purchase.productId === 'com.mashiur.expenseapp.yearly')
        subscriptionDays = 365;
    else if (purchase.productId === 'com.mashiur.expenseapp.monthly')
        subscriptionDays = 30;
    const expirationDate = new Date(purchaseDate);
    expirationDate.setDate(purchaseDate.getDate() + subscriptionDays);
    return now <= expirationDate;
}
function calculateDaysLeft(purchase) {
    const now = new Date();
    const purchaseDate = new Date(purchase.purchaseDate);
    let subscriptionDays = 0;
    if (purchase.productId === 'com.mashiur.expenseapp.yearly')
        subscriptionDays = 365;
    else if (purchase.productId === 'com.mashiur.expenseapp.monthly')
        subscriptionDays = 30;
    const expirationDate = new Date(purchaseDate);
    expirationDate.setDate(purchaseDate.getDate() + subscriptionDays);
    const timeDiff = expirationDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysLeft);
}
function getUserPurchases(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield inapp_model_1.InAppPurchase.find({ user: new mongoose_1.Types.ObjectId(userId) })
            .sort({ purchaseDate: -1 })
            .lean();
    });
}
function getAnyUserPurchaseHistoryForAdmin(targetUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield inapp_model_1.InAppPurchase.find({
            user: new mongoose_1.Types.ObjectId(targetUserId),
        })
            .populate('user', 'id email')
            .sort({ purchaseDate: -1 })
            .lean();
    });
}
