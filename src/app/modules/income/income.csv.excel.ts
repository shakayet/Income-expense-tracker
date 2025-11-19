import { Response } from 'express';
import ExcelJS from 'exceljs';
type IncomeItem = {
  source: string;
  amount: number;
};

type IncomeReport = {
  month: string;
  totalIncome: number;
  breakdown: IncomeItem[];
};

export function generateIncomeCSV(reportData: IncomeReport, res: Response) {
  const headers = ['Source', 'Amount ($)'];
  const rows = reportData.breakdown.map(
    item => `${item.source},${item.amount.toFixed(2)}`
  );
  rows.push(' ');
  // Add total row
  rows.push(`Total,${reportData.totalIncome.toFixed(2)}`);

  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=income-report-${reportData.month}.csv`
  );
  res.send(csv);
}

//Generate the Excel file....

export async function generateIncomeExcel(
  reportData: IncomeReport,
  res: Response
) {
  const workbook = new ExcelJS.Workbook();
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
    if (!column) return; // safety check
    let maxLength = 0;

    // Only call eachCell if it exists
    if (typeof column.eachCell === 'function') {
      column.eachCell({ includeEmpty: true }, cell => {
        const cellValue = cell.value ? cell.value.toString() : '';
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
    }

    column.width = maxLength + 5;
  });

  // Set headers for response
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=income-report-${reportData.month}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
}
