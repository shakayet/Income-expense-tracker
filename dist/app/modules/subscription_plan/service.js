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
exports.SubscriptionPlanService = void 0;
const model_1 = require("./model");
class SubscriptionPlanService {
    // Create new subscription plan
    createSubscriptionPlan(planData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plan = new model_1.SubscriptionPlan(planData);
                return yield plan.save();
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                // Handle duplicate key errors with a clearer message
                if (/E11000|duplicate key/i.test(msg)) {
                    throw new Error('Subscription plan with this plan_id already exists');
                }
                throw new Error(`Error creating subscription plan: ${msg}`);
            }
        });
    }
    // Get all subscription plans
    getAllSubscriptionPlans() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield model_1.SubscriptionPlan.find().sort({ created_at: -1 });
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                throw new Error(`Error fetching subscription plans: ${msg}`);
            }
        });
    }
    // Get subscription plan by ID
    getSubscriptionPlanById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plan = yield model_1.SubscriptionPlan.findById(id);
                if (!plan) {
                    throw new Error('Subscription plan not found');
                }
                return plan;
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                throw new Error(`Error fetching subscription plan: ${msg}`);
            }
        });
    }
    // Get subscription plan by plan_id
    getSubscriptionPlanByPlanId(planId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plan = yield model_1.SubscriptionPlan.findOne({ plan_id: planId });
                if (!plan) {
                    throw new Error('Subscription plan not found');
                }
                return plan;
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                throw new Error(`Error fetching subscription plan: ${msg}`);
            }
        });
    }
    // Update subscription plan
    updateSubscriptionPlan(id, planData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plan = yield model_1.SubscriptionPlan.findByIdAndUpdate(id, planData, {
                    new: true,
                    runValidators: true,
                });
                if (!plan) {
                    throw new Error('Subscription plan not found');
                }
                return plan;
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                throw new Error(`Error updating subscription plan: ${msg}`);
            }
        });
    }
    // Delete subscription plan
    deleteSubscriptionPlan(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plan = yield model_1.SubscriptionPlan.findByIdAndDelete(id);
                if (!plan) {
                    throw new Error('Subscription plan not found');
                }
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                throw new Error(`Error deleting subscription plan: ${msg}`);
            }
        });
    }
}
exports.SubscriptionPlanService = SubscriptionPlanService;
