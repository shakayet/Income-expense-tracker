"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSavingsPDF = generateSavingsPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
function generateSavingsPDF(reportData, res, name, email) {
    const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=savings-report.pdf');
    doc.pipe(res);
    // ===========================
    //           TITLE
    // ===========================
    doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('Savings Summary Report', { align: 'center' });
    // Horizontal line below heading
    const lineY = doc.y + 5;
    doc
        .moveTo(50, lineY)
        .lineTo(545, lineY)
        .strokeColor('black')
        .lineWidth(1)
        .stroke();
    doc.moveDown(2);
    // ===========================
    //       SUMMARY BOXES
    // ===========================
    const boxWidth = 240;
    const boxHeight = 80;
    const padding = 10;
    const radius = 5; // rounded corner radius
    const topY = doc.y;
    const currentMonth = new Date().toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    });
    // Left Box: fixed X
    const leftX = 50;
    doc
        .roundedRect(leftX, topY, boxWidth, boxHeight, radius)
        .strokeColor('black')
        .lineWidth(1)
        .stroke();
    doc
        .fillColor('black')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Name:', leftX + padding, topY + padding)
        .font('Helvetica')
        .text(name || '-', leftX + padding + 50, topY + padding)
        .font('Helvetica-Bold')
        .text('Email:', leftX + padding, topY + padding + 20)
        .font('Helvetica')
        .text(email || '-', leftX + padding + 50, topY + padding + 20)
        .font('Helvetica-Bold')
        .text('Month:', leftX + padding, topY + padding + 40)
        .font('Helvetica')
        .text(currentMonth, leftX + padding + 50, topY + padding + 40);
    // Right Box: align to right margin
    const pageWidth = doc.page.width;
    const rightX = pageWidth - doc.page.margins.right - boxWidth; // right aligned
    const totalInitial = reportData.reduce((sum, x) => sum + x.totalInitial, 0);
    const totalActual = reportData.reduce((sum, x) => sum + x.totalActual, 0);
    const totalSavings = reportData.reduce((sum, x) => sum + x.totalSavings, 0);
    doc
        .roundedRect(rightX, topY, boxWidth, boxHeight, radius)
        .strokeColor('black')
        .lineWidth(1)
        .stroke();
    doc
        .fillColor('black')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total Initial:', rightX + padding, topY + padding)
        .font('Helvetica')
        .text(totalInitial.toFixed(2), rightX + padding + 90, topY + padding)
        .font('Helvetica-Bold')
        .text('Total Actual:', rightX + padding, topY + padding + 20)
        .font('Helvetica')
        .text(totalActual.toFixed(2), rightX + padding + 90, topY + padding + 20)
        .font('Helvetica-Bold')
        .text('Total Savings:', rightX + padding, topY + padding + 40)
        .font('Helvetica')
        .text(totalSavings.toFixed(2), rightX + padding + 90, topY + padding + 40);
    // Move cursor below boxes
    doc.y = topY + boxHeight + 25;
    // ===========================
    //          TABLE
    // ===========================
    const tableTop = doc.y + 10;
    const col1X = 50; // Category
    const col2X = 220; // Initial
    const col3X = 350; // Actual
    const col4X = 460; // Savings
    const rowHeight = 30;
    const fontSize = 12;
    const categoryPaddingLeft = 5;
    const verticalOffset = (rowHeight - fontSize) / 2;
    // Table header
    doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('black')
        .text('Category', col1X + categoryPaddingLeft, tableTop + verticalOffset)
        .text('Initial ($)', col2X, tableTop + verticalOffset)
        .text('Actual ($)', col3X, tableTop + verticalOffset)
        .text('Savings ($)', col4X, tableTop + verticalOffset);
    doc
        .moveTo(col1X, tableTop + rowHeight)
        .lineTo(col4X + 80, tableTop + rowHeight)
        .strokeColor('#000')
        .stroke();
    // Table rows
    let y = tableTop + rowHeight;
    reportData.forEach((item, index) => {
        if (index % 2 === 0) {
            doc.rect(col1X, y, 490, rowHeight).fill('#f5f5f5').fillColor('black');
        }
        const textY = y + verticalOffset;
        doc
            .fontSize(fontSize)
            .font('Helvetica')
            .text(item.category, col1X + categoryPaddingLeft, textY)
            .text(item.totalInitial.toFixed(2), col2X, textY)
            .text(item.totalActual.toFixed(2), col3X, textY)
            .text(item.totalSavings.toFixed(2), col4X, textY);
        y += rowHeight;
        doc
            .moveTo(col1X, y)
            .lineTo(col4X + 80, y)
            .strokeColor('#cccccc')
            .stroke();
    });
    // Total row
    doc.rect(col1X, y, 490, rowHeight).fill('#d9edf7').fillColor('black');
    const totalTextY = y + verticalOffset;
    doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('TOTAL', col1X + categoryPaddingLeft, totalTextY)
        .text(totalInitial.toFixed(2), col2X, totalTextY)
        .text(totalActual.toFixed(2), col3X, totalTextY)
        .text(totalSavings.toFixed(2), col4X, totalTextY);
    doc.end();
}
