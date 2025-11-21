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
exports.generateIncomeCSV = generateIncomeCSV;
exports.generateIncomeExcel = generateIncomeExcel;
const exceljs_1 = __importDefault(require("exceljs"));
function generateIncomeCSV(reportData, res) {
    const headers = ['Source', 'Amount ($)'];
    const rows = reportData.breakdown.map(item => `${item.source},${item.amount.toFixed(2)}`);
    rows.push(' ');
    // Add total row
    rows.push(`Total,${reportData.totalIncome.toFixed(2)}`);
    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=income-report-${reportData.month}.csv`);
    res.send(csv);
}
//Generate the Excel file....
function generateIncomeExcel(reportData, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Income Report');
        // Add header row
        const headerRow = worksheet.addRow(['Source', 'Amount ($)']);
        headerRow.font = { bold: true };
        // Add data rows
        reportData.breakdown.forEach(item => {
            worksheet.addRow([item.source, item.amount]);
        });
        // Add total row
        const totalRow = worksheet.addRow(['Total', reportData.totalIncome]);
        totalRow.font = { bold: true };
        // Auto-width columns
        worksheet.columns.forEach(column => {
            if (!column)
                return; // safety check
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
        // Set headers for response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=income-report-${reportData.month}.xlsx`);
        yield workbook.xlsx.write(res);
        res.end();
    });
}
