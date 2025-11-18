import PDFDocument from 'pdfkit';
import { Response } from 'express';

export function generateReportPDF(
  reportData: any,
  res: Response,
  name: string | undefined,
  email: string | undefined
) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=income-expense-report.pdf'
  );

  doc.pipe(res);

  const {
    month,
    totalIncome,
    totalExpense,
    savings,
    budgetUsedPercentage,
    incomeCategoryPercentage,
    expenseCategoryPercentage,
  } = reportData;

  // ===========================
  //           TITLE
  // ===========================
  doc
    .fontSize(26)
    .font('Helvetica-Bold')
    .text('Monthly Income & Expense Report', { align: 'center' });

  doc.moveDown(0.8);

  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .strokeColor('#000000')
    .lineWidth(1)
    .stroke();

  doc.moveDown(1.2);

  // ===========================
  //       INFO BOX (LEFT)
  // ===========================
  const boxWidth = 260;
  const boxHeight = 100;
  const boxX = 40;
  const boxY = doc.y;

  doc
    .roundedRect(boxX, boxY, boxWidth, boxHeight, 10)
    .strokeColor('#000000')
    .lineWidth(1.4)
    .stroke();

  const paddingX = boxX + 10;
  const paddingY = boxY + 12;

  doc.font('Helvetica-Bold').fontSize(12).text('Name:', paddingX, paddingY);
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(name ?? 'N/A', paddingX + 50, paddingY);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Email:', paddingX, paddingY + 25);
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(email ?? 'N/A', paddingX + 50, paddingY + 25);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Month:', paddingX, paddingY + 50);
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(month, paddingX + 50, paddingY + 50);

  // ---------------------------
  // SUMMARY BOX (RIGHT SIDE)
  // ---------------------------
  const summaryX = 320;
  const summaryY = boxY;
  const summaryWidth = 215;
  const summaryHeight = boxHeight;

  doc
    .roundedRect(summaryX, summaryY, summaryWidth, summaryHeight, 10)
    .strokeColor('#000000')
    .lineWidth(1.4)
    .stroke();

  const sX = summaryX + 10;
  const sY = summaryY + 12;

  doc.font('Helvetica-Bold').fontSize(12).text('Total Income:', sX, sY);
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(`$${totalIncome.toLocaleString()}`, sX + 90, sY);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Total Expense:', sX, sY + 25);
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(`$${totalExpense.toLocaleString()}`, sX + 90, sY + 25);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Savings:', sX, sY + 50);
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(`$${savings.toLocaleString()}`, sX + 90, sY + 50);

  doc.moveDown(6);

  // ===========================
  // FUNCTION TO DRAW TABLES
  // ===========================
  const drawTable = (
    title: string,
    headers: string[],
    data: any[],
    xStart: number,
    yStart: number,
    colWidths: number[]
  ) => {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#000')
      .text(title, xStart, yStart);
    doc.moveDown(0.5);

    const rowHeight = 28;
    const cellPadding = 5;
    const fontSize = 12;
    let y = doc.y;

    // Header background
    doc
      .rect(
        xStart,
        y,
        colWidths.reduce((a, b) => a + b, 0),
        rowHeight
      )
      .fill('#d3d3d3')
      .fillColor('#000');

    headers.forEach((header, i) => {
      // Vertical centering
      const textY = y + (rowHeight - fontSize) / 2;
      doc
        .fontSize(fontSize)
        .font('Helvetica-Bold')
        .text(
          header,
          xStart +
            cellPadding +
            (i > 0 ? colWidths.slice(0, i).reduce((a, b) => a + b, 0) : 0),
          textY,
          {
            width: colWidths[i] - 2 * cellPadding,
            align: i === 0 ? 'left' : 'right',
          }
        );
    });

    y += rowHeight;

    data.forEach((row, idx) => {
      if (idx % 2 === 0) {
        doc
          .rect(
            xStart,
            y,
            colWidths.reduce((a, b) => a + b, 0),
            rowHeight
          )
          .fill('#f9f9f9')
          .fillColor('#000');
      }

      headers.forEach((header, i) => {
        const value =
          i === 0 ? row.category || 'Other' : row.percentage.toFixed(2);
        const textY = y + (rowHeight - fontSize) / 2; // vertical center
        doc
          .fontSize(fontSize)
          .font('Helvetica')
          .text(
            value,
            xStart +
              cellPadding +
              (i > 0 ? colWidths.slice(0, i).reduce((a, b) => a + b, 0) : 0),
            textY,
            {
              width: colWidths[i] - 2 * cellPadding,
              align: i === 0 ? 'left' : 'right',
            }
          );
      });

      y += rowHeight;

      // Horizontal line
      doc
        .moveTo(xStart, y)
        .lineTo(xStart + colWidths.reduce((a, b) => a + b, 0), y)
        .strokeColor('#cccccc')
        .stroke();
    });

    return y + 25; // extra space after table for better separation
  };

  // ===========================
  // INCOME TABLE
  // ===========================
  let nextY = drawTable(
    'Income by Category',
    ['Category', 'Percentage (%)'],
    incomeCategoryPercentage,
    40,
    doc.y,
    [300, 200]
  );

  // ===========================
  // EXPENSE TABLE
  // ===========================
  drawTable(
    'Expense by Category',
    ['Category', 'Percentage (%)'],
    expenseCategoryPercentage,
    40,
    nextY,
    [300, 200]
  );

  doc.end();
}
