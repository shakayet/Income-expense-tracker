"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchTypeModel = exports.Marketplace = void 0;
const mongoose_1 = require("mongoose");
const marketplaceSchema = new mongoose_1.Schema({
    name: { type: String },
    price: { type: Number },
    image: { type: String },
    marketplace: { type: String },
    productUrl: { type: String },
}, {
    timestamps: true,
});
exports.Marketplace = (0, mongoose_1.model)('Marketplace', marketplaceSchema);
const searchTypeSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: ['GENERIC', 'API'],
        required: true,
    },
}, {
    timestamps: true,
});
exports.SearchTypeModel = (0, mongoose_1.model)('SearchType', searchTypeSchema);
