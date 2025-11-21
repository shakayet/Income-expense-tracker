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
exports.yearlyReportController = exports.monthlyReportController = void 0;
const report_service_1 = require("./report.service");
const monthlyReportController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { month } = req.query;
        if (!month || typeof month !== 'string') {
            return res
                .status(400)
                .json({
                success: false,
                message: 'Month is required in format YYYY-MM',
            });
        }
        const report = yield (0, report_service_1.getMonthlyReport)(userId, month);
        res.json({ success: true, data: report });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: 'Failed to get monthly report', error });
    }
});
exports.monthlyReportController = monthlyReportController;
const yearlyReportController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { year } = req.query;
        if (!year || typeof year !== 'string') {
            return res
                .status(400)
                .json({ success: false, message: 'Year is required in format YYYY' });
        }
        const report = yield (0, report_service_1.getYearlyReport)(userId, year);
        res.json({ success: true, data: report });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: 'Failed to get yearly report', error });
    }
});
exports.yearlyReportController = yearlyReportController;
