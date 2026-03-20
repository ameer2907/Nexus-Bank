const PDFDocument = require('pdfkit');

const generateInvoicePDF = (transaction, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Nexus Global Bank - Invoice ${transaction.transactionId}`,
          Author: 'Nexus Global Bank',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const primaryColor = '#0066FF';
      const darkColor = '#0A0F1E';
      const grayColor = '#6B7280';
      const lightGray = '#F3F4F6';

      // ─── HEADER ───────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 120).fill(darkColor);

      doc.fontSize(28).fillColor('#FFFFFF').font('Helvetica-Bold').text('NEXUS', 50, 35);
      doc.fontSize(10).fillColor(primaryColor).font('Helvetica').text('GLOBAL BANK', 50, 68);
      doc.fontSize(8).fillColor('#9CA3AF').text('International Currency Exchange', 50, 83);

      // Invoice label on right
      doc.fontSize(22).fillColor('#FFFFFF').font('Helvetica-Bold').text('INVOICE', 0, 40, { align: 'right', width: doc.page.width - 50 });
      doc.fontSize(10).fillColor(primaryColor).font('Helvetica').text(transaction.transactionId, 0, 68, { align: 'right', width: doc.page.width - 50 });

      // ─── ACCENT LINE ──────────────────────────────────────────
      doc.rect(0, 120, doc.page.width, 4).fill(primaryColor);

      // ─── BILL TO / FROM ───────────────────────────────────────
      const infoY = 145;
      doc.fontSize(8).fillColor(grayColor).font('Helvetica-Bold').text('BILL TO', 50, infoY);
      doc.fontSize(12).fillColor(darkColor).font('Helvetica-Bold').text(user.name, 50, infoY + 14);
      doc.fontSize(9).fillColor(grayColor).font('Helvetica').text(user.email, 50, infoY + 30);
      doc.fontSize(9).fillColor(grayColor).text(`Account: ${user.accountNumber || 'N/A'}`, 50, infoY + 44);

      // Date info on right
      doc.fontSize(8).fillColor(grayColor).font('Helvetica-Bold').text('DATE', 0, infoY, { align: 'right', width: doc.page.width - 50 });
      doc.fontSize(10).fillColor(darkColor).font('Helvetica').text(
        new Date(transaction.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        0, infoY + 14, { align: 'right', width: doc.page.width - 50 }
      );
      doc.fontSize(8).fillColor(grayColor).text(
        new Date(transaction.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        0, infoY + 30, { align: 'right', width: doc.page.width - 50 }
      );

      // ─── DIVIDER ──────────────────────────────────────────────
      doc.moveTo(50, 215).lineTo(doc.page.width - 50, 215).strokeColor('#E5E7EB').lineWidth(1).stroke();

      // ─── TRANSACTION TABLE HEADER ─────────────────────────────
      const tableY = 235;
      doc.rect(50, tableY, doc.page.width - 100, 28).fill(darkColor);
      const cols = [50, 220, 340, 460];
      const headers = ['DESCRIPTION', 'FROM', 'TO', 'RATE'];
      headers.forEach((h, i) => {
        doc.fontSize(8).fillColor('#9CA3AF').font('Helvetica-Bold').text(h, cols[i] + 10, tableY + 10);
      });

      // ─── TABLE ROW ────────────────────────────────────────────
      const rowY = tableY + 38;
      doc.rect(50, tableY + 28, doc.page.width - 100, 40).fill(lightGray);
      doc.fontSize(10).fillColor(darkColor).font('Helvetica-Bold').text('Currency Exchange', cols[0] + 10, rowY);
      doc.fontSize(9).fillColor(grayColor).font('Helvetica').text('FX Transaction', cols[0] + 10, rowY + 14);
      doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold').text(
        `${transaction.amount.toLocaleString()} ${transaction.fromCurrency}`, cols[1] + 10, rowY + 3
      );
      doc.fontSize(11).fillColor('#059669').font('Helvetica-Bold').text(
        `${transaction.convertedAmount.toLocaleString()} ${transaction.toCurrency}`, cols[2] + 10, rowY + 3
      );
      doc.fontSize(10).fillColor(darkColor).font('Helvetica').text(
        `1 ${transaction.fromCurrency} = ${transaction.rate} ${transaction.toCurrency}`, cols[3] + 10, rowY + 3
      );

      // ─── SUMMARY BOX ──────────────────────────────────────────
      const summaryX = doc.page.width - 270;
      const summaryY = rowY + 65;

      doc.rect(summaryX, summaryY, 220, 130).fill('#F9FAFB').stroke('#E5E7EB');

      const rows = [
        ['Subtotal', `${transaction.convertedAmount.toFixed(4)} ${transaction.toCurrency}`],
        ['GST (18%)', `${transaction.gstAmount.toFixed(4)} ${transaction.toCurrency}`],
      ];

      rows.forEach(([label, value], i) => {
        const y = summaryY + 18 + i * 28;
        doc.fontSize(9).fillColor(grayColor).font('Helvetica').text(label, summaryX + 15, y);
        doc.fontSize(9).fillColor(darkColor).font('Helvetica-Bold').text(value, summaryX + 15, y, { align: 'right', width: 190 });
      });

      // Divider
      doc.moveTo(summaryX + 15, summaryY + 78).lineTo(summaryX + 205, summaryY + 78).strokeColor('#E5E7EB').lineWidth(1).stroke();

      // Total
      doc.rect(summaryX, summaryY + 84, 220, 46).fill(darkColor);
      doc.fontSize(10).fillColor('#9CA3AF').font('Helvetica-Bold').text('TOTAL DUE', summaryX + 15, summaryY + 96);
      doc.fontSize(14).fillColor('#FFFFFF').font('Helvetica-Bold').text(
        `${transaction.totalAmount.toFixed(4)} ${transaction.toCurrency}`,
        summaryX + 15, summaryY + 96, { align: 'right', width: 190 }
      );

      // ─── STATUS BADGE ─────────────────────────────────────────
      const badgeY = summaryY + 65;
      doc.rect(50, badgeY, 100, 28).fill('#D1FAE5');
      doc.fontSize(9).fillColor('#059669').font('Helvetica-Bold').text('✓ COMPLETED', 50, badgeY + 9, { width: 100, align: 'center' });

      // ─── FOOTER ───────────────────────────────────────────────
      const footerY = doc.page.height - 80;
      doc.rect(0, footerY - 15, doc.page.width, 95).fill(darkColor);
      doc.moveTo(0, footerY - 15).lineTo(doc.page.width, footerY - 15).strokeColor(primaryColor).lineWidth(2).stroke();

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text(
        'Nexus Global Bank  •  International Currency Exchange  •  support@nexusglobalbank.com',
        50, footerY + 5, { align: 'center', width: doc.page.width - 100 }
      );
      doc.fontSize(7).fillColor('#4B5563').text(
        'This is a computer-generated invoice and does not require a signature. All transactions are processed under applicable financial regulations.',
        50, footerY + 22, { align: 'center', width: doc.page.width - 100 }
      );
      doc.fontSize(7).fillColor('#374151').text(
        `Transaction ID: ${transaction.transactionId}  •  Processed: ${new Date(transaction.createdAt).toISOString()}`,
        50, footerY + 40, { align: 'center', width: doc.page.width - 100 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
