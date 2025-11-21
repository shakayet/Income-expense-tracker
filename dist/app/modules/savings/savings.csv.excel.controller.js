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
exports.savingsExcelController = exports.savingsCSVController = void 0;
const savings_service_1 = require("./savings.service");
const savings_csv_excel_1 = require("./savings.csv.excel");
const savingsCSVController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // Ensure user ID exists
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Fetch savings summary
        const reportData = yield savings_service_1.SavingsService.getSavingsSummaryByCategory(userId);
        if (!reportData || reportData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No savings data found',
            });
        }
        const name = (_b = req.user) === null || _b === void 0 ? void 0 : _b.name;
        const email = (_c = req.user) === null || _c === void 0 ? void 0 : _c.email;
        // Generate CSV
        const csvContent = yield (0, savings_csv_excel_1.generateSavingsCSV)(reportData);
        // Set headers so browser downloads the CSV
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="savings-report.csv"');
        // Send CSV
        return res.send(csvContent);
    }
    catch (error) {
        console.error('CSV Error:', error);
        return res.status(500).json({
            success: false,
            error: 'CSV generation failed',
        });
    }
});
exports.savingsCSVController = savingsCSVController;
const savingsExcelController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const reportData = yield savings_service_1.SavingsService.getSavingsSummaryByCategory(userId);
        if (!reportData || reportData.length === 0)
            return res.status(400).json({ message: 'No savings data found' });
        yield (0, savings_csv_excel_1.generateSavingsExcel)(reportData, res);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Excel generation failed' });
    }
});
exports.savingsExcelController = savingsExcelController;
