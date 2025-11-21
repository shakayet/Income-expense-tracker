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
exports.expensePdfController = void 0;
const mongoose_1 = require("mongoose");
const expense_controller_1 = require("./expense.controller");
const expense_pdf_1 = require("./expense.pdf");
const expensePdfController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
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
        const email = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
        const name = (_c = req.user) === null || _c === void 0 ? void 0 : _c.name;
        console.log('data', req.user);
        const reportData = yield (0, expense_controller_1.getMonthlyExpenseSummaryForPdf)(userId, monthString);
        if (!reportData || !reportData.data) {
            return res.status(400).json({
                success: false,
                message: 'No expense data provided',
            });
        }
        console.log(reportData);
        // Generate and stream PDF to client
        return (0, expense_pdf_1.generateExpensePDF)(reportData, res, email, name);
    }
    catch (error) {
        console.error('PDF Error:', error);
        return res.status(500).json({
            success: false,
            error: 'PDF generation failed',
        });
    }
});
exports.expensePdfController = expensePdfController;
