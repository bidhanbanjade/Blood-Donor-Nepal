const nodemailer = require('nodemailer');
const config = require('../config/config');

let transporter;

const initializeEmailService = () => {
  if (transporter) return transporter;

  // Use test account in development or real SMTP in production
  const isProduction = process.env.NODE_ENV === 'production';
  const smtpConfig = isProduction
    ? {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: process.env.SMTP_USER || 'user',
          pass: process.env.SMTP_PASS || 'pass',
        },
      };

  transporter = nodemailer.createTransport(smtpConfig);
  return transporter;
};

const sendOTPEmail = async (email, otp) => {
  try {
    const mailer = initializeEmailService();

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || 'noreply@blooddonor.nepal',
      to: email,
      subject: 'Your Blood Donor Nepal OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #174663;">Blood Donor Nepal</h2>
          <p>Your one-time password (OTP) is:</p>
          <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; text-align: center;">
            <h1 style="color: #DC2626; letter-spacing: 2px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code will expire in 10 minutes. Do not share it with anyone.
          </p>
          <p style="color: #999; font-size: 12px;">
            If you did not request this code, please ignore this email.
          </p>
        </div>
      `,
    };

    const result = await mailer.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeEmailService,
  sendOTPEmail,
};
