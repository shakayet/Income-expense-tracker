"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Marketplacecredential = void 0;
const mongoose_1 = require("mongoose");
const marketplacecredentialSchema = new mongoose_1.Schema({
    marketplaceName: {
        type: String,
        enum: ['amazon', 'ebay', 'alibaba', 'zalando', 'leroy_merlin'],
        required: true,
    },
    clientId: { type: String },
    clientSecret: { type: String },
    refreshToken: { type: String },
    awsAccessKeyId: { type: String },
    awsSecretAccessKey: { type: String },
    marketplaceId: { type: String },
    environment: {
        type: String,
        enum: ['sandbox', 'production'],
        default: 'sandbox',
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
}, {
    timestamps: true,
});
exports.Marketplacecredential = (0, mongoose_1.model)('Marketplacecredential', marketplacecredentialSchema);
