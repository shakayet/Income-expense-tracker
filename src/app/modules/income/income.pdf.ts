import PDFDocument from 'pdfkit';
import { Response } from 'express';

export function generateIncomePDF(
  reportData: any,
  res: Response,
  name: string | undefined,
  email: string | undefined
) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=income-report.pdf'
  );

  doc.pipe(res);

  const { month, totalIncome, breakdown } = reportData.data;

  // ===========================
  //           TITLE
  // ===========================
  doc
    .fontSize(26)
    .font('Helvetica-Bold')
    .text('Monthly Income Report', { align: 'center' });

  // Slight spacing under title
  doc.moveDown(0.8);

  // Horizontal line
  doc
    .moveTo(60, doc.y)
    .lineTo(550, doc.y)
    .strokeColor('#000000')
    .lineWidth(1)
    .stroke();

  doc.moveDown(1.2);

  // ===========================
  //     INFO BOX (LEFT SIDE)
  // ===========================
  const boxWidth = 260;
  const boxHeight = 100;
  const boxX = 60; // left side
  const boxY = doc.y;

  doc
    .roundedRect(boxX, boxY, boxWidth, boxHeight, 10)
    .strokeColor('#000000')
    .lineWidth(1.4)
    .stroke();

  const paddingX = boxX + 14;
  const paddingY = boxY + 12;

  // Name
  doc.font('Helvetica-Bold').fontSize(12).text('Name:', paddingX, paddingY);
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(name ?? 'N/A', paddingX + 70, paddingY);

  // Email
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Email:', paddingX, paddingY + 25);
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(email ?? 'N/A', paddingX + 70, paddingY + 25);

  // Month
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Month:', paddingX, paddingY + 50);
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(month, paddingX + 70, paddingY + 50);

  // Move cursor below box
  doc.y = boxY + boxHeight + 25;

  // ===========================
  //          TABLE
  // ===========================
  const tableTop = doc.y;
  const itemX = 60;
  const amountX = 400;
  const rowHeight = 30;
  const tableWidth = 480;
  const amountColumnWidth = 100;
  const categoryPaddingLeft = 10;
  const fontSize = 12;
  const verticalOffset = (rowHeight - fontSize) / 2;

  // Table header
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('black')
    .text('Source', itemX + categoryPaddingLeft, tableTop + verticalOffset, {
      width: tableWidth - amountColumnWidth - categoryPaddingLeft * 2,
    })
    .text('Amount ($)', amountX, tableTop + verticalOffset, {
      width: amountColumnWidth,
      align: 'right',
    });

  doc
    .moveTo(itemX, tableTop + rowHeight)
    .lineTo(itemX + tableWidth, tableTop + rowHeight)
    .strokeColor('#000')
    .stroke();

  // ===========================
  //        TABLE ROWS
  // ===========================
  let y = tableTop + rowHeight;

  breakdown.forEach((item: any, index: number) => {
    if (index % 2 === 0) {
      doc.rect(itemX, y, tableWidth, rowHeight).fill('#f9f9f9');
      doc.fillColor('black');
    }

    const textY = y + verticalOffset;

    doc
      .fontSize(fontSize)
      .font('Helvetica')
      .text(item.source, itemX + categoryPaddingLeft, textY)
      .text(item.amount.toFixed(2), amountX, textY, {
        width: amountColumnWidth - 20,
        align: 'right',
      });

    y += rowHeight;

    doc
      .moveTo(itemX, y)
      .lineTo(itemX + tableWidth, y)
      .strokeColor('#cccccc')
      .stroke();
  });

  // Better spacing before total row
  y += 12;

  // ===========================
  //        TOTAL ROW
  // ===========================
  doc.rect(itemX, y, tableWidth, rowHeight).fill('#d9edf7').fillColor('black');

  const totalTextY = y + verticalOffset;

  doc
    .fontSize(13)
    .font('Helvetica-Bold')
    .text('Total Income', itemX + categoryPaddingLeft, totalTextY)
    .text(totalIncome.toFixed(2), amountX, totalTextY, {
      width: amountColumnWidth - 20,
      align: 'right',
    });

  doc.end();
}
