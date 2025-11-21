"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppPurchase = void 0;
const mongoose_1 = require("mongoose");
const inAppPurchaseSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productId: {
        type: String,
        required: true,
        trim: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.InAppPurchase = (0, mongoose_1.model)('InAppPurchase', inAppPurchaseSchema);
