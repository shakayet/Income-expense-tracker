"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlan = void 0;
const mongoose_1 = require("mongoose");
const subscriptionPlanSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 100,
    },
    plan_id: {
        type: String,
        required: true,
        unique: true,
        maxlength: 100,
    },
    // legacy/camelCase field - some older data/indexes use `planId`
    planId: {
        type: String,
        maxlength: 100,
    },
    duration_days: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});
// Indexes for better performance
// `plan_id` is already declared `unique: true` in the schema definition which
// creates a unique index; avoid creating a duplicate index here.
// subscriptionPlanSchema.index({ plan_id: 1 }); // duplicate - removed
subscriptionPlanSchema.index({ created_at: -1 });
subscriptionPlanSchema.pre('validate', function (next) {
    // If one of the fields exists but the other doesn't, copy the value so unique indexes won't see null
    if (!this.planId && this.plan_id) {
        this.planId = this.plan_id;
    }
    if (!this.plan_id && this.planId) {
        this.plan_id = this.planId;
    }
    next();
});
exports.SubscriptionPlan = (0, mongoose_1.model)('SubscriptionPlan', subscriptionPlanSchema);
