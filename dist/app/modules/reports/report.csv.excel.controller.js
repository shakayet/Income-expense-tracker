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
exports.reportExcelController = exports.reportCSVController = void 0;
const report_service_1 = require("./report.service");
const report_csv_excel_1 = require("./report.csv.excel");
const reportCSVController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        let { month } = req.query;
        // Validate & convert month to string
        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'Month query parameter is required',
            });
        }
        // Convert to string safely
        if (Array.isArray(month)) {
            month = month[0]; // extract only first element
        }
        if (typeof month !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid month format',
            });
        }
        const monthString = month;
        const reportData = yield (0, report_service_1.getMonthlyReport)(userId, monthString);
        if (!reportData || !reportData) {
            return res.status(400).json({
                success: false,
                message: 'No expense data provided',
            });
        }
        // Generate and stream PDF to client
        const csvData = (0, report_csv_excel_1.generateFinanceCSV)(reportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=finance-report-${reportData.month}.csv`);
        res.send(csvData);
    }
    catch (error) {
        console.error('PDF Error:', error);
        return res.status(500).json({
            success: false,
            error: 'PDF generation failed',
        });
    }
});
exports.reportCSVController = reportCSVController;
const reportExcelController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(req.user);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        let { month } = req.query;
        // Validate & convert month to string
        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'Month query parameter is required',
            });
        }
        // Convert to string safely
        if (Array.isArray(month)) {
            month = month[0]; // extract only first element
        }
        if (typeof month !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid month format',
            });
        }
        const monthString = month;
        const reportData = yield (0, report_service_1.getMonthlyReport)(userId, monthString);
        if (!reportData || !reportData) {
            return res.status(400).json({
                success: false,
                message: 'No expense data provided',
            });
        }
        // Generate and stream PDF to client
        yield (0, report_csv_excel_1.generateFinanceExcel)(reportData, res);
    }
    catch (error) {
        console.error('PDF Error:', error);
        return res.status(500).json({
            success: false,
            error: 'PDF generation failed',
        });
    }
});
exports.reportExcelController = reportExcelController;
