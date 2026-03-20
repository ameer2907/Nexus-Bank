const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendTransactionEmail = async (user, transaction, pdfBuffer = null) => {
  // If email not configured, skip silently
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email not configured. Skipping email send.');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();

    const formattedDate = new Date(transaction.createdAt).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F3F4F6; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
  .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: #0A0F1E; padding: 36px 32px; text-align: center; }
  .logo-text { color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 2px; }
  .logo-sub { color: #0066FF; font-size: 11px; letter-spacing: 4px; margin-top: 4px; }
  .accent-bar { height: 3px; background: linear-gradient(90deg, #0066FF, #00C8FF); }
  .body { padding: 36px 32px; }
  .greeting { font-size: 20px; color: #111827; font-weight: 700; margin-bottom: 8px; }
  .subtitle { color: #6B7280; font-size: 14px; margin-bottom: 28px; }
  .amount-box { background: linear-gradient(135deg, #0A0F1E 0%, #1a2744 100%); border-radius: 10px; padding: 24px; margin-bottom: 24px; text-align: center; }
  .amount-label { color: #9CA3AF; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
  .amount-main { font-size: 32px; color: #ffffff; font-weight: 800; }
  .amount-arrow { color: #0066FF; font-size: 24px; margin: 8px 0; }
  .amount-result { font-size: 28px; color: #10B981; font-weight: 800; }
  .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .detail-item { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; }
  .detail-label { font-size: 10px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .detail-value { font-size: 13px; color: #111827; font-weight: 600; }
  .gst-box { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
  .gst-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
  .gst-row:last-child { margin-bottom: 0; font-weight: 700; color: #1D4ED8; border-top: 1px solid #BFDBFE; padding-top: 8px; margin-top: 4px; }
  .txn-id { background: #F9FAFB; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 12px; color: #374151; margin-bottom: 24px; word-break: break-all; }
  .footer-text { color: #9CA3AF; font-size: 12px; line-height: 1.6; text-align: center; }
  .footer { background: #0A0F1E; padding: 20px; text-align: center; }
  .footer p { color: #4B5563; font-size: 11px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="logo-text">NEXUS</div>
      <div class="logo-sub">GLOBAL BANK</div>
    </div>
    <div class="accent-bar"></div>
    <div class="body">
      <div class="greeting">Transaction Confirmed ✓</div>
      <p class="subtitle">Your currency exchange has been processed successfully.</p>

      <div class="amount-box">
        <div class="amount-label">Exchange Summary</div>
        <div class="amount-main">${transaction.amount.toLocaleString()} ${transaction.fromCurrency}</div>
        <div class="amount-arrow">↓</div>
        <div class="amount-result">${transaction.convertedAmount.toLocaleString()} ${transaction.toCurrency}</div>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">Exchange Rate</div>
          <div class="detail-value">1 ${transaction.fromCurrency} = ${transaction.rate} ${transaction.toCurrency}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Date & Time</div>
          <div class="detail-value">${formattedDate}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Account</div>
          <div class="detail-value">${user.accountNumber || 'N/A'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Status</div>
          <div class="detail-value" style="color: #10B981;">● Completed</div>
        </div>
      </div>

      <div class="gst-box">
        <div class="gst-row"><span>Converted Amount</span><span>${transaction.convertedAmount.toFixed(4)} ${transaction.toCurrency}</span></div>
        <div class="gst-row"><span>GST (18%)</span><span>${transaction.gstAmount.toFixed(4)} ${transaction.toCurrency}</span></div>
        <div class="gst-row"><span>Total Amount</span><span>${transaction.totalAmount.toFixed(4)} ${transaction.toCurrency}</span></div>
      </div>

      <div class="txn-id">Transaction ID: ${transaction.transactionId}</div>

      <p class="footer-text">A GST invoice PDF is attached to this email for your records. Please keep it safe for tax purposes.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Nexus Global Bank • All rights reserved</p>
      <p style="margin-top: 6px;">This is an automated email. Please do not reply.</p>
    </div>
  </div>
</div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Nexus Global Bank" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `✅ Transaction Confirmed - ${transaction.transactionId}`,
      html: htmlBody,
    };

    // Attach PDF if provided
    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: `Invoice_${transaction.transactionId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${user.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send failed: ${error.message}`);
    return { success: false, message: error.message };
  }
};

module.exports = { sendTransactionEmail };
