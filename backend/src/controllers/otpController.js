const { validationResult } = require('express-validator');
const { OTP } = require('../models');
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
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    return res.status(200).json({
      message: `OTP sent to ${normalizedEmail}`,
      otpId: otp.id,
      expiresIn: 600, // 10 minutes in seconds
    });
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
