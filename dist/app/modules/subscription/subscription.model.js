"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = require("mongoose");
const subscriptionSchema = new mongoose_1.Schema({
    customerId: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    planTitle: {
        type: String,
        required: true,
    },
    trxId: {
        type: String,
        required: true,
    },
    subscriptionId: {
        type: String,
        required: true,
    },
    currentPeriodStart: {
        type: String,
        required: true,
    },
    currentPeriodEnd: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['expired', 'active', 'cancel'],
        default: 'active',
        required: true,
    },
}, {
    timestamps: true,
});
exports.Subscription = (0, mongoose_1.model)('Subscription', subscriptionSchema);
