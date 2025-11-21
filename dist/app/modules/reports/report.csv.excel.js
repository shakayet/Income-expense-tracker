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
exports.generateFinanceCSV = generateFinanceCSV;
exports.generateFinanceExcel = generateFinanceExcel;
const exceljs_1 = __importDefault(require("exceljs"));
// =============================
//       CSV GENERATOR
// =============================
function generateFinanceCSV(report) {
    const rows = [];
    // Income breakdown
    rows.push('Income Category,Income Amount ,Percentage');
    report.incomeCategoryPercentage.forEach(item => {
        rows.push(`${item.category},${item.amount},${item.percentage}`);
    });
    rows.push('');
    // Expense breakdown
    rows.push('Expense Category,Expense Amount ,Percentage');
    report.expenseCategoryPercentage.forEach(item => {
        rows.push(`${item.category},${item.amount},${item.percentage}`);
    });
    rows.push('');
    rows.push('');
    // General info
    rows.push(`Month,${report.month}`);
    rows.push(`Budget,${report.budget}`);
    rows.push(`Total Income,${report.totalIncome}`);
    rows.push(`Total Expense,${report.totalExpense}`);
    rows.push(`Savings,${report.savings}`);
    rows.push(`Budget Used Percentage,${report.budgetUsedPercentage}`);
    rows.push('');
    return rows.join('\n');
}
// =============================
//       EXCEL GENERATOR
// =============================
function generateFinanceExcel(report, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Finance Report');
        // -----------------
        // General Info
        // -----------------
        worksheet.addRow(['Month', report.month]);
        worksheet.addRow(['Budget', report.budget]);
        worksheet.addRow(['Total Income', report.totalIncome]);
        worksheet.addRow(['Total Expense', report.totalExpense]);
        worksheet.addRow(['Savings', report.savings]);
        worksheet.addRow(['Budget Used Percentage', report.budgetUsedPercentage]);
        worksheet.addRow([]); // empty row
        // -----------------
        // Income Breakdown
        // -----------------
        worksheet.addRow(['Income Category', 'Income Amount', 'Percentage']);
        const incomeHeader = worksheet.lastRow;
        if (incomeHeader)
            incomeHeader.font = { bold: true };
        report.incomeCategoryPercentage.forEach(item => {
            worksheet.addRow([item.category, item.amount, item.percentage]);
        });
        worksheet.addRow([]); // empty row
        // -----------------
        // Expense Breakdown
        // -----------------
        worksheet.addRow(['Expense Category', 'Expense Amount', 'Percentage']);
        const expenseHeader = worksheet.lastRow;
        if (expenseHeader)
            expenseHeader.font = { bold: true };
        report.expenseCategoryPercentage.forEach(item => {
            worksheet.addRow([item.category, item.amount, item.percentage]);
        });
        // -----------------
        // Auto-width columns
        // -----------------
        worksheet.columns.forEach(column => {
            if (!column)
                return;
            let maxLength = 0;
            if (typeof column.eachCell === 'function') {
                column.eachCell({ includeEmpty: true }, cell => {
                    const value = cell.value ? cell.value.toString() : '';
                    if (value.length > maxLength)
                        maxLength = value.length;
                });
            }
            column.width = maxLength + 5;
        });
        // -----------------
        // Send as Excel response
        // -----------------
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=finance-report-${report.month}.xlsx`);
        yield workbook.xlsx.write(res);
        res.end();
    });
}
