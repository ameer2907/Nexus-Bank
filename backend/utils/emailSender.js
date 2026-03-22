const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
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
  // If email not configured → skip safely
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Email not configured. Skipping email.');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();

    const formattedDate = new Date(transaction.createdAt).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; background: #f3f4f6; }
  .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; }
  .header { text-align: center; background: #0A0F1E; color: #fff; padding: 20px; }
  .amount { font-size: 22px; margin: 20px 0; text-align: center; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>NEXUS GLOBAL BANK</h2>
    </div>

    <h3>Transaction Confirmed ✅</h3>
    <p>Your currency exchange was successful.</p>

    <div class="amount">
      ${transaction.amount} ${transaction.fromCurrency} → 
      ${transaction.convertedAmount} ${transaction.toCurrency}
    </div>

    <p><b>Date:</b> ${formattedDate}</p>
    <p><b>Transaction ID:</b> ${transaction.transactionId}</p>

    <p>Thank you for using Nexus Bank.</p>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Nexus Bank" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Transaction Confirmed - ${transaction.transactionId}`,
      html: htmlBody,
    };

    // Attach PDF if exists
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
    console.log(`✅ Email sent: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = { sendTransactionEmail };