import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const formatCurrency = (amount) => `৳${Number(amount).toLocaleString()}`;

export const generateInstructorFinancialsPdf = (data) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
        doc.on('error', reject);

        doc.fontSize(24).font('Helvetica-Bold').text('Instructor Financial Report', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`For: ${data.instructorName} (${data.instructorEmail})`, { align: 'center' });
        doc.text(`Period: ${data.period}`, { align: 'center' });
        doc.moveDown(1.5);

        doc.fontSize(16).font('Helvetica-Bold').text('Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Total Net Earnings: ${formatCurrency(data.summary.totalEarned)}`);
        doc.text(`Total Paid Out: ${formatCurrency(data.summary.totalPaidOut)}`);
        doc.text(`Total Platform Fees: ${formatCurrency(data.summary.totalPlatformFees)}`);
        doc.text(`Pending Payouts: ${formatCurrency(data.summary.pendingPayouts)}`);
        doc.moveDown(1.5);

        if (data.courseSales && data.courseSales.length > 0) {
            doc.fontSize(16).font('Helvetica-Bold').text('Sales by Course', { underline: true });
            doc.moveDown(0.5);

            const tableHeaders = ['Course Title', 'Sales', 'Gross Revenue', 'Platform Fee', 'Net Income'];
            const tableRows = data.courseSales.map(cs => [
                cs.courseTitle,
                cs.totalSales.toLocaleString(),
                formatCurrency(cs.totalRevenue),
                `- ${formatCurrency(cs.totalPlatformFee)}`,
                formatCurrency(cs.netIncome)
            ]);

            const startY = doc.y;
            const startX = 50;
            const colWidths = [200, 70, 90, 90, 90];

            doc.font('Helvetica-Bold').fontSize(10);
            tableHeaders.forEach((header, i) => {
                doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, { width: colWidths[i], align: 'left' });
            });
            doc.moveDown(1);
            doc.font('Helvetica').fontSize(9);

            let currentY = doc.y;
            tableRows.forEach(row => {
                row.forEach((cell, i) => {
                    doc.text(cell, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), currentY, { width: colWidths[i], align: (i === 0) ? 'left' : 'right' });
                });
                currentY += 20;
                if (currentY > doc.page.height - 50) {
                    doc.addPage();
                    currentY = 50;
                    doc.font('Helvetica-Bold').fontSize(10);
                    tableHeaders.forEach((header, i) => {
                        doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), currentY, { width: colWidths[i], align: 'left' });
                    });
                    doc.moveDown(1);
                    doc.font('Helvetica').fontSize(9);
                    currentY = doc.y;
                }
            });
        } else {
             doc.fontSize(12).font('Helvetica').text('No course sales data for this period.', { align: 'center' });
        }

        doc.end();
    });
};

export const generateInstructorFinancialsCsv = (data) => {
    let csv = '';

    csv += `Instructor Financial Report\n`;
    csv += `For: ${data.instructorName} (${data.instructorEmail})\n`;
    csv += `Period: ${data.period}\n\n`;

    csv += `Summary\n`;
    csv += `Total Net Earnings,${data.summary.totalEarned}\n`;
    csv += `Total Paid Out,${data.summary.totalPaidOut}\n`;
    csv += `Total Platform Fees,${data.summary.totalPlatformFees}\n`;
    csv += `Pending Payouts,${data.summary.pendingPayouts}\n\n`;

    if (data.courseSales && data.courseSales.length > 0) {
        csv += `Sales by Course\n`;
        csv += `Course Title,Total Sales,Gross Revenue,Platform Fee,Net Income\n`;
        data.courseSales.forEach(cs => {
            csv += `"${cs.courseTitle}",${cs.totalSales},${cs.totalRevenue},${cs.totalPlatformFee},${cs.netIncome}\n`;
        });
    } else {
        csv += `No course sales data for this period.\n`;
    }

    return csv;
};

export const generatePlatformFinancialsPdf = (data) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
        doc.on('error', reject);

        doc.fontSize(24).font('Helvetica-Bold').text('Platform Financial Report', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`Period: ${data.period}`, { align: 'center' });
        doc.moveDown(1.5);
        doc.fontSize(16).font('Helvetica-Bold').text('Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Total Gross Revenue: ${formatCurrency(data.summary.totalRevenue)}`);
        doc.text(`Net Platform Income: ${formatCurrency(data.summary.netPlatformIncome)}`);
        doc.text(`Total Instructor Earnings: ${formatCurrency(data.summary.totalInstructorEarnings)}`);
        doc.text(`Total Paid to Instructors: ${formatCurrency(data.summary.totalPaidOut)}`);
        doc.text(`Pending Payouts: ${formatCurrency(data.summary.pendingPayouts)}`);
        doc.moveDown(1.5);

        if (data.transactions && data.transactions.length > 0) {
            doc.fontSize(16).font('Helvetica-Bold').text('Recent Transactions', { underline: true });
            doc.moveDown(0.5);

            const tableHeaders = ['Date', 'Course', 'Student', 'Instructor', 'Amount', 'Platform Fee'];
            const tableRows = data.transactions.map(tx => [
                new Date(tx.createdAt).toLocaleDateString(),
                tx.courseId?.courseTitle || 'N/A',
                tx.userId?.name || 'N/A',
                tx.courseId?.creator?.name || 'N/A',
                formatCurrency(tx.amount),
                formatCurrency(tx.platformFee)
            ]);

            const startY = doc.y;
            const startX = 50;
            const colWidths = [60, 120, 100, 100, 80, 80];

            doc.font('Helvetica-Bold').fontSize(10);
            tableHeaders.forEach((header, i) => {
                doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, { width: colWidths[i], align: 'left' });
            });
            doc.moveDown(1);
            doc.font('Helvetica').fontSize(9);

            let currentY = doc.y;
            tableRows.forEach(row => {
                row.forEach((cell, i) => {
                    doc.text(cell, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), currentY, { width: colWidths[i], align: (i === 0 || i === 1 || i === 2 || i === 3) ? 'left' : 'right' });
                });
                currentY += 20;
                if (currentY > doc.page.height - 50) {
                    doc.addPage();
                    currentY = 50;
                    doc.font('Helvetica-Bold').fontSize(10);
                    tableHeaders.forEach((header, i) => {
                        doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), currentY, { width: colWidths[i], align: 'left' });
                    });
                    doc.moveDown(1);
                    doc.font('Helvetica').fontSize(9);
                    currentY = doc.y;
                }
            });
        } else {
            doc.fontSize(12).font('Helvetica').text('No transaction data for this period.', { align: 'center' });
        }

        doc.end();
    });
};

export const generatePlatformFinancialsCsv = (data) => {
    let csv = '';
    csv += `Platform Financial Report\n`;
    csv += `Period: ${data.period}\n\n`;

    csv += `Summary\n`;
    csv += `Total Gross Revenue,${data.summary.totalRevenue}\n`;
    csv += `Net Platform Income,${data.summary.netPlatformIncome}\n`;
    csv += `Total Instructor Earnings,${data.summary.totalInstructorEarnings}\n`;
    csv += `Total Paid to Instructors,${data.summary.totalPaidOut}\n`;
    csv += `Pending Payouts,${data.summary.pendingPayouts}\n\n`;

    if (data.transactions && data.transactions.length > 0) {
        csv += `Recent Transactions\n`;
        csv += `Date,Course Title,Student Name,Instructor Name,Amount,Platform Fee\n`;
        data.transactions.forEach(tx => {
            csv += `${new Date(tx.createdAt).toLocaleDateString()},"${tx.courseId?.courseTitle || 'N/A'}","${tx.userId?.name || 'N/A'}","${tx.courseId?.creator?.name || 'N/A'}",${tx.amount},${tx.platformFee}\n`;
        });
    } else {
        csv += `No transaction data for this period.\n`;
    }

    return csv;
};
