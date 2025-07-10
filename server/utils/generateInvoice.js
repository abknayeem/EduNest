import PDFDocument from 'pdfkit';
import fs from 'fs';

export const generateInvoice = (purchaseDetails, filePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('EduNest', 50, 50);
        doc
            .fontSize(10)
            .font('Helvetica')
            .text('Raynagar, Sylhet-3100', 50, 70)
            .text('Bangladesh', 50, 85);

        doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('INVOICE', 200, 50, { align: 'right' });
        doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Invoice #: ${purchaseDetails._id.toString().slice(-8)}`, 200, 70, { align: 'right' })
            .text(`Date: ${new Date(purchaseDetails.createdAt).toLocaleDateString()}`, 200, 85, { align: 'right' });

        doc.moveDown(3);
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Bill To:');
        doc
            .fontSize(10)
            .font('Helvetica')
            .text(purchaseDetails.userId.name)
            .text(purchaseDetails.userId.email);

        doc.moveDown(2);
        const tableTop = doc.y;
        const itemX = 50;
        const descriptionX = 150;
        const priceX = 450;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Item', itemX, tableTop);
        doc.text('Description', descriptionX, tableTop);
        doc.text('Price', priceX, tableTop, { width: 100, align: 'right' });
        doc.lineCap('butt').moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        const itemTop = tableTop + 25;
        doc.fontSize(10).font('Helvetica');
        doc.text('1', itemX, itemTop);
        doc.text(purchaseDetails.courseId.courseTitle, descriptionX, itemTop);
        doc.text(`BDT ${purchaseDetails.amount.toFixed(2)}`, priceX, itemTop, { width: 100, align: 'right' });
        doc.lineCap('butt').moveTo(50, itemTop + 15).lineTo(550, itemTop + 15).stroke();
        
        const totalTop = itemTop + 25;
        doc.font('Helvetica-Bold');
        doc.text('Total', descriptionX, totalTop, {width: 300, align: 'right'});
        doc.text(`BDT ${purchaseDetails.amount.toFixed(2)}`, priceX, totalTop, { width: 100, align: 'right' });

        doc
            .fontSize(10)
            .font('Helvetica-Oblique')
            .text('Thank you for your business.', 50, 700, { align: 'center', width: 500 });
        
        doc.end();

        writeStream.on('finish', () => {
            resolve();
        });

        writeStream.on('error', (err) => {
            reject(err);
        });
    });
};