"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: ['monthly-report', 'yearly-report', 'budget-warning'],
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    reportMonth: { type: String },
    reportYear: { type: String },
    budgetAmount: { type: Number },
    usedAmount: { type: Number },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
