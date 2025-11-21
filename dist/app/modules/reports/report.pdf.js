"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportPDF = generateReportPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
function generateReportPDF(reportData, res, name, email) {
    const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=income-expense-report.pdf');
    doc.pipe(res);
    const { month, totalIncome, totalExpense, savings, budgetUsedPercentage, incomeCategoryPercentage, expenseCategoryPercentage, } = reportData;
    // ============================
    //           TITLE
    // ============================
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
    // ============================
    //       INFO BOX (LEFT)
    // ============================
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
        .text(name !== null && name !== void 0 ? name : 'N/A', paddingX + 70, paddingY);
    doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Email:', paddingX, paddingY + 25);
    doc
        .font('Helvetica')
        .fontSize(12)
        .text(email !== null && email !== void 0 ? email : 'N/A', paddingX + 70, paddingY + 25);
    doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Month:', paddingX, paddingY + 50);
    doc
        .font('Helvetica')
        .fontSize(12)
        .text(month, paddingX + 70, paddingY + 50);
    // ============================
    // SUMMARY BOX (RIGHT)
    // ============================
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
        .text(`$${totalIncome.toLocaleString()}`, sX + 100, sY);
    doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Total Expense:', sX, sY + 25);
    doc
        .font('Helvetica')
        .fontSize(12)
        .text(`$${totalExpense.toLocaleString()}`, sX + 100, sY + 25);
    doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Savings:', sX, sY + 50);
    doc
        .font('Helvetica')
        .fontSize(12)
        .text(`$${Number(savings).toLocaleString()}`, sX + 100, sY + 50);
    doc.moveDown(6);
    // ============================
    //        TABLE MAKER
    // ============================
    const drawTable = (title, headers, data, xStart, yStart, colWidths) => {
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
            .rect(xStart, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
            .fill('#d3d3d3')
            .fillColor('#000000');
        // ===== UPDATED: ADD RIGHT PADDING IN HEADERS =====
        headers.forEach((header, i) => {
            const textY = y + (rowHeight - fontSize) / 2;
            doc
                .fontSize(fontSize)
                .font('Helvetica-Bold')
                .text(header, xStart +
                cellPadding +
                (i > 0 ? colWidths.slice(0, i).reduce((a, b) => a + b, 0) : 0), textY, {
                width: colWidths[i] - cellPadding * 3, // ← right padding added
                align: i === 0 ? 'left' : 'right',
            });
        });
        y += rowHeight;
        data.forEach((row, idx) => {
            var _a, _b;
            if (idx % 2 === 0) {
                doc
                    .rect(xStart, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                    .fill('#f9f9f9')
                    .fillColor('#000');
            }
            const rowValues = [
                row.category || 'Other',
                row.amount ? `$${row.amount.toLocaleString()}` : '-',
                `${(_b = (_a = row.percentage) === null || _a === void 0 ? void 0 : _a.toFixed(2)) !== null && _b !== void 0 ? _b : 0}%`,
            ];
            // ===== UPDATED: ADD RIGHT PADDING FOR BODY CELLS =====
            headers.forEach((_, i) => {
                const textY = y + (rowHeight - fontSize) / 2;
                doc
                    .fontSize(fontSize)
                    .font('Helvetica')
                    .text(rowValues[i], xStart +
                    cellPadding +
                    (i > 0 ? colWidths.slice(0, i).reduce((a, b) => a + b, 0) : 0), textY, {
                    width: colWidths[i] - cellPadding * 3, // ← right padding added
                    align: i === 0 ? 'left' : 'right',
                });
            });
            y += rowHeight;
            doc
                .moveTo(xStart, y)
                .lineTo(xStart + colWidths.reduce((a, b) => a + b, 0), y)
                .strokeColor('#cccccc')
                .stroke();
        });
        return y + 25;
    };
    // ============================
    // INCOME TABLE
    // ============================
    let nextY = drawTable('Income by Category', ['Category', 'Amount ($)', 'Percentage (%)'], incomeCategoryPercentage, 40, doc.y, [200, 150, 150]);
    // ============================
    // EXPENSE TABLE
    // ============================
    drawTable('Expense by Category', ['Category', 'Amount ($)', 'Percentage (%)'], expenseCategoryPercentage, 40, nextY, [200, 150, 150]);
    doc.end();
}
