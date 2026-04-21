const nodemailer = require('nodemailer');
const webpush = require('web-push');
const twilio = require('twilio');
const config = require('../config/config');

if (config.webPush.publicKey && config.webPush.privateKey) {
  webpush.setVapidDetails(config.webPush.subject, config.webPush.publicKey, config.webPush.privateKey);
}

const createTransporter = () => {
  const { user: smtpUser, password: smtpPass } = getEmailCredentials();

  if (!smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

const twilioClient =
  config.sms.twilioSid && config.sms.twilioToken
    ? twilio(config.sms.twilioSid, config.sms.twilioToken)
    : null;

const getEmailCredentials = () => ({
  user:
    config.email.user ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    '',
  password:
    config.email.password ||
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASSWORD ||
    '',
});

const getEmailFromAddress = () =>
  process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || getEmailCredentials().user || '';

const sendPushNotification = async (subscription, payload) => {
  if (!config.webPush.publicKey || !config.webPush.privateKey) {
    return { sent: false, reason: 'VAPID keys not configured' };
  }

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    JSON.stringify(payload)
  );

  return { sent: true };
};

const sendEmailNotification = async ({ to, subject, text }) => {
  const transporter = createTransporter();
  if (!transporter) {
    return { sent: false, reason: 'Email credentials not configured' };
  }

  const fromAddress = getEmailFromAddress();

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
  });

  return { sent: true };
};

const sendSmsNotification = async ({ to, message }) => {
  if (!twilioClient || !config.sms.twilioFrom) {
    return { sent: false, reason: 'SMS provider not configured' };
  }

  await twilioClient.messages.create({
    body: message,
    from: config.sms.twilioFrom,
    to,
  });

  return { sent: true };
};

module.exports = {
  sendPushNotification,
  sendEmailNotification,
  sendSmsNotification,
};
