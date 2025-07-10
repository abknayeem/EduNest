import PDFDocument from 'pdfkit';
import fs from 'fs';

export const generateCertificate = (studentName, courseName, date, filePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
        });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f4f8');

        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(3).stroke('#003366');

        doc.fontSize(40).font('Helvetica-Bold').fillColor('#003366').text('Certificate of Completion', {
            align: 'center'
        }, 100);

        doc.fontSize(20).font('Helvetica').fillColor('#333').text('This is to certify that', {
            align: 'center'
        }, 180);

        doc.fontSize(36).font('Helvetica-Bold').fillColor('#0055a4').text(studentName, {
            align: 'center'
        }, 220);

        doc.fontSize(20).font('Helvetica').fillColor('#333').text('has successfully completed the course', {
            align: 'center'
        }, 280);

        doc.fontSize(28).font('Helvetica-Bold').fillColor('#003366').text(`"${courseName}"`, {
            align: 'center'
        }, 320);

        doc.fontSize(14).font('Helvetica').text(`Date: ${date}`, 50, 450);
        doc.text('EduNest Platform', 550, 450, { align: 'right' });
        
        doc.end();

        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => reject(err));
    });
};