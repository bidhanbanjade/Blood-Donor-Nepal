const nodemailer = require('nodemailer');

let transporter;

const getSmtpCredentials = () => {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  return { smtpUser, smtpPass };
};

const initializeEmailService = () => {
  if (transporter) return transporter;

  const { smtpUser, smtpPass } = getSmtpCredentials();

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials are not configured');
  }

  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  };

  transporter = nodemailer.createTransport(smtpConfig);
  return transporter;
};

const sendOTPEmail = async (email, otp) => {
  try {
    const { smtpUser, smtpPass } = getSmtpCredentials();
    const devOtpEnabled = process.env.ENABLE_DEV_OTP === 'true';

    // Dev fallback is explicit opt-in only.
    if (!smtpUser || !smtpPass) {
      if (!devOtpEnabled) {
        return {
          success: false,
          error: 'SMTP credentials are not configured. Set SMTP_USER and SMTP_PASS.',
        };
      }

      console.log(`[DEV OTP] ${email}: ${otp}`);
      return { success: true, mode: 'dev-fallback' };
    }

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
    return { success: true, mode: 'smtp', messageId: result.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeEmailService,
  sendOTPEmail,
};
