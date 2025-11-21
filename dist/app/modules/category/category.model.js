"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    name: { type: String, required: true },
    icon: { type: String, required: true },
});
exports.Category = (0, mongoose_1.model)('Category', categorySchema);
