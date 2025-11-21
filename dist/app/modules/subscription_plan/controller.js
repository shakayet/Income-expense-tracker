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
exports.SubscriptionPlanController = void 0;
const service_1 = require("./service");
const subscriptionPlanService = new service_1.SubscriptionPlanService();
class SubscriptionPlanController {
    createSubscriptionPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plan = yield subscriptionPlanService.createSubscriptionPlan(req.body);
                res.status(201).json({
                    success: true,
                    data: plan,
                });
            }
            catch (error) {
                // Log real error and return message for easier debugging (will be handled by global error handler in production)
                // eslint-disable-next-line no-console
                console.error('createSubscriptionPlan error:', error);
                const message = error instanceof Error
                    ? error.message
                    : 'error at createSubscriptionPlan';
                const status = /already exists/i.test(message) ? 409 : 400;
                res.status(status).json({
                    success: false,
                    message,
                });
            }
        });
    }
    getAllSubscriptionPlans(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plans = yield subscriptionPlanService.getAllSubscriptionPlans();
                res.status(200).json({
                    success: true,
                    data: plans,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'error at getAllSubscriptionPlans',
                });
            }
        });
    }
    getSubscriptionPlanById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plan = yield subscriptionPlanService.getSubscriptionPlanById(req.params.id);
                res.status(200).json({
                    success: true,
                    data: plan,
                });
            }
            catch (error) {
                res.status(404).json({
                    success: false,
                    message: 'error at getSubscriptionPlanById',
                });
            }
        });
    }
    updateSubscriptionPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plan = yield subscriptionPlanService.updateSubscriptionPlan(req.params.id, req.body);
                res.status(200).json({
                    success: true,
                    data: plan,
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: 'error at updateSubscriptionPlan',
                });
            }
        });
    }
    deleteSubscriptionPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield subscriptionPlanService.deleteSubscriptionPlan(req.params.id);
                res.status(200).json({
                    success: true,
                    message: 'Subscription plan deleted successfully',
                });
            }
            catch (error) {
                res.status(404).json({
                    success: false,
                    message: 'error at deleteSubscriptionPlan',
                });
            }
        });
    }
}
exports.SubscriptionPlanController = SubscriptionPlanController;
