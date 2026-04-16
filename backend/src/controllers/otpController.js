const { validationResult } = require('express-validator');
const { OTP, User } = require('../models');
const { sendOTPEmail } = require('../services/emailService');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, purpose } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (purpose === 'signup' && existingUser) {
      return res.status(409).json({ error: 'Email already registered. Please log in instead.' });
    }

    if (purpose !== 'signup' && !existingUser) {
      return res.status(404).json({ error: 'No account found for this email.' });
    }

    // Generate OTP code
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Mark any previous OTPs as used for this email/purpose
    await OTP.update(
      { isUsed: true },
      {
        where: {
          email: normalizedEmail,
          purpose,
          isUsed: false,
        },
      }
    );

    // Create new OTP record
    const otp = await OTP.create({
      email: normalizedEmail,
      code,
      purpose,
      expiresAt,
    });

    // Send email
    const emailResult = await sendOTPEmail(normalizedEmail, code);

    if (!emailResult.success) {
      await otp.destroy();
      return res.status(500).json({ error: emailResult.error || 'Failed to send OTP email' });
    }

    const responseBody = {
      message: `OTP sent to ${normalizedEmail}`,
      otpId: otp.id,
      expiresIn: 600, // 10 minutes in seconds
    };

    if (emailResult.mode === 'dev-fallback') {
      responseBody.devOtp = code;
      responseBody.delivery = 'dev-fallback';
    }

    return res.status(200).json(responseBody);
  } catch (error) {
    return next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, code, purpose } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const otp = await OTP.findOne({
      where: {
        email: normalizedEmail,
        code,
        purpose,
        isUsed: false,
      },
    });

    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if OTP has expired
    if (new Date() > otp.expiresAt) {
      await otp.update({ isUsed: true });
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Check attempt count (max 5 attempts)
    if (otp.attemptCount >= 5) {
      await otp.update({ isUsed: true });
      return res.status(400).json({ error: 'Too many failed attempts. Request a new OTP.' });
    }

    // Mark OTP as used
    await otp.update({ isUsed: true });

    return res.status(200).json({
      message: 'OTP verified successfully',
      verified: true,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};
