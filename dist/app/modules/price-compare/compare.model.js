"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const costCompareSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    initialPrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    savedAmount: { type: Number, required: true },
    costType: { type: String, required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("CostCompare", costCompareSchema);
