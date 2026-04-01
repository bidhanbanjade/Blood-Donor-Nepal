require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  authCookieName: process.env.AUTH_COOKIE_NAME || 'token',
  authCookieSecure: process.env.COOKIE_SECURE === 'true',
  authCookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'blood_donation_nepal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  },
  a2a: {
    apiKey: process.env.A2A_API_KEY || '',
    agentUrl: process.env.A2A_AGENT_URL || ''
  },
  webPush: {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:admin@blooddonationnepal.local'
  },
  sms: {
    apiKey: process.env.SMS_API_KEY || '',
    provider: process.env.SMS_PROVIDER || 'twilio',
    twilioSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFrom: process.env.TWILIO_FROM || ''
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || ''
  }
};


