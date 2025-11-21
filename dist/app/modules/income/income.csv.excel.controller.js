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
exports.incomeExcelController = exports.incomeCSVController = void 0;
const mongoose_1 = require("mongoose");
const income_controller_1 = require("./income.controller");
const income_csv_excel_1 = require("./income.csv.excel");
const incomeCSVController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
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
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        // const name: string | undefined = req.user.name;
        // const email: string | undefined = req.user.email;
        const reportData = yield (0, income_controller_1.getMonthlyIncomeSummaryForPdf)(userId, monthString);
        if (!reportData || !(reportData === null || reportData === void 0 ? void 0 : reportData.data)) {
            return res.status(400).json({
                success: false,
                message: 'No Income data provided',
            });
        }
        // Generate and stream PDF to client
        (0, income_csv_excel_1.generateIncomeCSV)(reportData.data, res);
    }
    catch (error) {
        // console.error('PDF Error:', error);
        return res.status(500).json({
            success: false,
            error: 'CSV generation failed',
        });
    }
});
exports.incomeCSVController = incomeCSVController;
const incomeExcelController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
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
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        // const name: string | undefined = req.user.name;
        // const email: string | undefined = req.user.email;
        const reportData = yield (0, income_controller_1.getMonthlyIncomeSummaryForPdf)(userId, monthString);
        if (!reportData || !(reportData === null || reportData === void 0 ? void 0 : reportData.data)) {
            return res.status(400).json({
                success: false,
                message: 'No Income data provided',
            });
        }
        // Generate and stream PDF to client
        (0, income_csv_excel_1.generateIncomeExcel)(reportData.data, res);
    }
    catch (error) {
        // console.error('PDF Error:', error);
        return res.status(500).json({
            success: false,
            error: 'CSV generation failed',
        });
    }
});
exports.incomeExcelController = incomeExcelController;
