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
exports.incomePdfController = void 0;
const mongoose_1 = require("mongoose");
const income_controller_1 = require("./income.controller");
const income_pdf_1 = require("./income.pdf");
const incomePdfController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const name = req.user.name;
        const email = req.user.email;
        const reportData = yield (0, income_controller_1.getMonthlyIncomeSummaryForPdf)(userId, monthString);
        if (!reportData || !(reportData === null || reportData === void 0 ? void 0 : reportData.data)) {
            return res.status(400).json({
                success: false,
                message: 'No expense data provided',
            });
        }
        console.log(reportData);
        // Generate and stream PDF to client
        return (0, income_pdf_1.generateIncomePDF)(reportData, res, name, email);
    }
    catch (error) {
        console.error('PDF Error:', error);
        return res.status(500).json({
            success: false,
            error: 'PDF generation failed',
        });
    }
});
exports.incomePdfController = incomePdfController;
