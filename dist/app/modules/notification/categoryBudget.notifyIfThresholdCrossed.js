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
exports.notifyIfCategoryThresholdCrossed = void 0;
const notification_service_1 = require("./notification.service");
const notifyIfCategoryThresholdCrossed = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, categoryId, month, totalExpense, budgetAmount, existingThresholds = [], }) {
    const percentage = (totalExpense / budgetAmount) * 100;
    const thresholds = [80, 100];
    for (const t of thresholds) {
        if (percentage >= t && !existingThresholds.includes(t)) {
            yield (0, notification_service_1.createNotification)({
                type: 'category-budget-exceeded',
                title: `Category Budget Alert: ${t}% reached`,
                message: `You've used ${t}% of your category budget for month ${month}. Tap to see details.`,
                reportMonth: month,
                categoryId: categoryId.toString(),
                detailsLink: `/api/v1/category/details?categoryId=${categoryId}&month=${month}`,
            }, userId.toString());
            existingThresholds.push(t);
        }
    }
    if (percentage > 100 && !existingThresholds.includes(101)) {
        yield (0, notification_service_1.createNotification)({
            type: 'category-budget-exceeded',
            title: `Category Budget Exceeded!`,
            message: `You've exceeded your category budget for month ${month}. Tap to see details.`,
            reportMonth: month,
            categoryId: categoryId.toString(),
            detailsLink: `/api/v1/category/details?categoryId=${categoryId}&month=${month}`,
        }, userId.toString());
        existingThresholds.push(101);
    }
});
exports.notifyIfCategoryThresholdCrossed = notifyIfCategoryThresholdCrossed;
