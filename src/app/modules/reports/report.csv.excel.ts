import { Response } from 'express';
import ExcelJS from 'exceljs';

type CategoryPercentage = {
  category: string;
  amount: number;
  percentage: number;
};

type FinanceReport = {
  month: string;
  budget: number;
  totalIncome: number;
  totalExpense: number;
  savings: string;
  budgetUsedPercentage: string;
  incomeCategoryPercentage: CategoryPercentage[];
  expenseCategoryPercentage: CategoryPercentage[];
};

// =============================
//       CSV GENERATOR
// =============================
export function generateFinanceCSV(report: FinanceReport): string {
  const rows: string[] = [];

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
export async function generateFinanceExcel(
  report: FinanceReport,
  res: Response
) {
  const workbook = new ExcelJS.Workbook();
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
  if (incomeHeader) incomeHeader.font = { bold: true };

  report.incomeCategoryPercentage.forEach(item => {
    worksheet.addRow([item.category, item.amount, item.percentage]);
  });

  worksheet.addRow([]); // empty row

  // -----------------
  // Expense Breakdown
  // -----------------
  worksheet.addRow(['Expense Category', 'Expense Amount', 'Percentage']);
  const expenseHeader = worksheet.lastRow;
  if (expenseHeader) expenseHeader.font = { bold: true };

  report.expenseCategoryPercentage.forEach(item => {
    worksheet.addRow([item.category, item.amount, item.percentage]);
  });

  // -----------------
  // Auto-width columns
  // -----------------
  worksheet.columns.forEach(column => {
    if (!column) return;
    let maxLength = 0;
    if (typeof column.eachCell === 'function') {
      column.eachCell({ includeEmpty: true }, cell => {
        const value = cell.value ? cell.value.toString() : '';
        if (value.length > maxLength) maxLength = value.length;
      });
    }
    column.width = maxLength + 5;
  });

  // -----------------
  // Send as Excel response
  // -----------------
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=finance-report-${report.month}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
}
