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
exports.sendYearlyNotifications = exports.sendMonthlyNotifications = void 0;
const notification_service_1 = require("../app/modules/notification/notification.service");
const report_service_1 = require("../app/modules/reports/report.service");
const user_service_1 = require("../app/modules/user/user.service");
const sendMonthlyNotifications = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const users = yield (0, user_service_1.getAllUsersFromDB)();
    const date = new Date();
    const currentYear = String(date.getFullYear());
    const prevMonth = String(date.getMonth() === 0 ? 12 : date.getMonth()).padStart(2, '0');
    const selectDate = currentYear + '-' + prevMonth;
    for (const user of users) {
        if (!user || !user.id)
            continue;
        const monthlyReport = yield (0, report_service_1.getMonthlyReport)(user.id, selectDate);
        const monthlyData = {
            type: 'monthly-report',
            title: 'Your Monthly Report is Ready',
            message: `Tap to see your report for ${prevMonth}/${currentYear}`,
            reportMonth: prevMonth,
            reportYear: currentYear,
        };
        if (((_a = monthlyReport === null || monthlyReport === void 0 ? void 0 : monthlyReport.totalIncome) !== null && _a !== void 0 ? _a : -1) >= 0 ||
            ((_b = monthlyReport === null || monthlyReport === void 0 ? void 0 : monthlyReport.totalExpense) !== null && _b !== void 0 ? _b : -1) >= 0) {
            yield (0, notification_service_1.createNotification)(monthlyData, user.id);
        }
    }
});
exports.sendMonthlyNotifications = sendMonthlyNotifications;
const sendYearlyNotifications = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const users = yield (0, user_service_1.getAllUsersFromDB)();
    const date = new Date();
    // const currentYear = String(date.getFullYear());
    const prevYear = (date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear()).toString();
    for (const user of users) {
        if (!user || !user.id)
            continue;
        const yearlyReport = yield (0, report_service_1.getYearlyReport)(user.id, prevYear);
        const yearlyData = {
            type: 'yearly-report',
            title: 'Your Yearly Report is Ready',
            message: `Tap to see your report for ${prevYear}`,
            reportYear: prevYear,
        };
        if (((_a = yearlyReport === null || yearlyReport === void 0 ? void 0 : yearlyReport.totalIncome) !== null && _a !== void 0 ? _a : -1) >= 0 ||
            ((_b = yearlyReport === null || yearlyReport === void 0 ? void 0 : yearlyReport.totalExpense) !== null && _b !== void 0 ? _b : -1) >= 0) {
            yield (0, notification_service_1.createNotification)(yearlyData, user.id);
        }
    }
});
exports.sendYearlyNotifications = sendYearlyNotifications;
