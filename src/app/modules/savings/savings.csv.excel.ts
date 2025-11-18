import { Response } from 'express';
import ExcelJS from 'exceljs';
type SavingsData = {
  category: string;
  totalInitial: number;
  totalActual: number;
  totalSavings: number;
};

//generate the CSV file by this function...
export async function generateSavingsCSV(
  reportData: SavingsData[]
): Promise<string> {
  // Define CSV headers
  const headers = [
    'Category',
    'Total Initial',
    'Total Actual',
    'Total Savings',
  ];

  // Map each object to a CSV row
  const rows = reportData.map(
    item =>
      `${item.category},${item.totalInitial},${item.totalActual},${item.totalSavings}`
  );

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
}

// generating the Excel file by this function
export async function generateSavingsExcel(
  reportData: SavingsData[],
  res: Response
) {
  const workbook = new ExcelJS.Workbook();
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
    if (!column) return; // column might be undefined

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

  // Set response headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="savings-report.xlsx"'
  );

  // Write workbook to buffer and send it
  const buffer = await workbook.xlsx.writeBuffer();
  res.send(buffer);
}
