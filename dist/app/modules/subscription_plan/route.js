"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlan = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = (0, express_1.Router)();
const subscriptionPlanController = new controller_1.SubscriptionPlanController();
router.post('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), subscriptionPlanController.createSubscriptionPlan);
router.get('/', subscriptionPlanController.getAllSubscriptionPlans);
router.get('/:id', subscriptionPlanController.getSubscriptionPlanById);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER), subscriptionPlanController.updateSubscriptionPlan);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER), subscriptionPlanController.deleteSubscriptionPlan);
exports.SubscriptionPlan = router;
