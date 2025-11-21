"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsModel = void 0;
const mongoose_1 = require("mongoose");
const termsSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    version: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
}, { timestamps: true });
exports.TermsModel = (0, mongoose_1.model)("Terms", termsSchema);
