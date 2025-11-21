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
exports.generateExpenseCSV = generateExpenseCSV;
exports.generateExpenseExcel = generateExpenseExcel;
const exceljs_1 = __importDefault(require("exceljs"));
//generate the expense CSV file..
function generateExpenseCSV(reportData, res) {
    const { month, totalExpense, breakdown } = reportData.data;
    // CSV headers
    const headers = ['Source', 'Amount'];
    // Map breakdown to CSV rows
    const rows = breakdown.map(item => `${item.source},${item.amount}`);
    rows.push('');
    // Add total row
    rows.push(`Total,${totalExpense}`);
    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="expense-${month}.csv"`);
    res.send(csvContent);
}
// generate Excel File...
function generateExpenseExcel(reportData, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Expense Report');
        // Add header row
        const headerRow = worksheet.addRow(['Source', 'Amount']);
        headerRow.font = { bold: true };
        // Add data rows
        reportData.breakdown.forEach(item => {
            worksheet.addRow([item.source, item.amount]);
        });
        // Add total row
        const totalRow = worksheet.addRow(['Total Expense', reportData.totalExpense]);
        totalRow.font = { bold: true };
        // Auto width for columns
        worksheet.columns.forEach(column => {
            var _a;
            if (!column)
                return;
            let maxLength = 0;
            (_a = column.eachCell) === null || _a === void 0 ? void 0 : _a.call(column, { includeEmpty: true }, cell => {
                const cellValue = cell.value ? cell.value.toString() : '';
                if (cellValue.length > maxLength)
                    maxLength = cellValue.length;
            });
            column.width = maxLength + 5;
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="expense-report-${reportData.month}.xlsx"`);
        // Write workbook to response
        yield workbook.xlsx.write(res);
        res.end();
    });
}
