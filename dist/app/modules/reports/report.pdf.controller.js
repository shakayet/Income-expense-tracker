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
exports.reportPdfController = void 0;
const report_service_1 = require("./report.service");
const report_pdf_1 = require("./report.pdf");
const reportPdfController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
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
        const name = (_b = req.user) === null || _b === void 0 ? void 0 : _b.name;
        const email = (_c = req.user) === null || _c === void 0 ? void 0 : _c.email;
        console.log(reportData);
        // Generate and stream PDF to client
        return (0, report_pdf_1.generateReportPDF)(reportData, res, name, email);
    }
    catch (error) {
        console.error('PDF Error:', error);
        return res.status(500).json({
            success: false,
            error: 'PDF generation failed',
        });
    }
});
exports.reportPdfController = reportPdfController;
