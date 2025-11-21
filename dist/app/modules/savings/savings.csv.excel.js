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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSavingsCSV = generateSavingsCSV;
exports.generateSavingsExcel = generateSavingsExcel;
const exceljs_1 = __importDefault(require("exceljs"));
//generate the CSV file by this function...
function generateSavingsCSV(reportData) {
    return __awaiter(this, void 0, void 0, function* () {
        // Define CSV headers
        const headers = [
            'Category',
            'Total Initial',
            'Total Actual',
            'Total Savings',
        ];
        // Map each object to a CSV row
        const rows = reportData.map(item => `${item.category},${item.totalInitial},${item.totalActual},${item.totalSavings}`);
        // Combine headers and rows
        return [headers.join(','), ...rows].join('\n');
    });
}
// generating the Excel file by this function
function generateSavingsExcel(reportData, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Savings Report');
        // Add header row
        const headerRow = worksheet.addRow([
            'Category',
            'Total Initial',
            'Total Actual',
            'Total Savings',
        ]);
        headerRow.font = { bold: true };
        // Add data rows
        reportData.forEach(item => {
            worksheet.addRow([
                item.category,
                item.totalInitial,
                item.totalActual,
                item.totalSavings,
            ]);
        });
        // Auto-width for columns
        worksheet.columns.forEach(column => {
            if (!column)
                return; // column might be undefined
            let maxLength = 0;
            // Only call eachCell if it exists
            if (typeof column.eachCell === 'function') {
                column.eachCell({ includeEmpty: true }, cell => {
                    const cellValue = cell.value ? cell.value.toString() : '';
                    if (cellValue.length > maxLength)
                        maxLength = cellValue.length;
                });
            }
            column.width = maxLength + 5;
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="savings-report.xlsx"');
        // Write workbook to buffer and send it
        const buffer = yield workbook.xlsx.writeBuffer();
        res.send(buffer);
    });
}
