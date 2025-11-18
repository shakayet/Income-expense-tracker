import { Response } from 'express';
import ExcelJS from 'exceljs';
type ExpenseItem = {
  categoryName: string;
  amount: number;
};

type ExpenseReport = {
  month: string;
  totalExpense: number;
  breakdown: ExpenseItem[];
};

//generate the expense CSV file..

export function generateExpenseCSV(
  reportData: {
    data: { month: string; totalExpense: number; breakdown: ExpenseItem[] };
  },
  res: Response
) {
  const { month, totalExpense, breakdown } = reportData.data;

  // CSV headers
  const headers = ['Category', 'Amount'];

  // Map breakdown to CSV rows
  const rows = breakdown.map(item => `${item.categoryName},${item.amount}`);

  // Add total row
  rows.push(`Total,${totalExpense}`);

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Set headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="expense-${month}.csv"`
  );

  res.send(csvContent);
}

// generate Excel File...

export async function generateExpenseExcel(
  reportData: ExpenseReport,
  res: Response
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expense Report');

  // Add header row
  const headerRow = worksheet.addRow(['Category', 'Amount']);
  headerRow.font = { bold: true };

  // Add data rows
  reportData.breakdown.forEach(item => {
    worksheet.addRow([item.categoryName, item.amount]);
  });

  // Add total row
  const totalRow = worksheet.addRow(['Total Expense', reportData.totalExpense]);
  totalRow.font = { bold: true };

  // Auto width for columns
  worksheet.columns.forEach(column => {
    if (!column) return;

    let maxLength = 0;
    column.eachCell?.({ includeEmpty: true }, cell => {
      const cellValue = cell.value ? cell.value.toString() : '';
      if (cellValue.length > maxLength) maxLength = cellValue.length;
    });
    column.width = maxLength + 5;
  });

  // Set response headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="expense-report-${reportData.month}.xlsx"`
  );

  // Write workbook to response
  await workbook.xlsx.write(res);
  res.end();
}
