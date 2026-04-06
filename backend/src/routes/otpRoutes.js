const express = require('express');
const { body } = require('express-validator');
const otpController = require('../controllers/otpController');

const router = express.Router();

router.post(
  '/send',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('purpose')
      .isIn(['login', 'signup', 'reset'])
      .withMessage('Purpose must be login, signup, or reset'),
  ],
  otpController.sendOTP
);

router.post(
  '/verify',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('purpose')
      .isIn(['login', 'signup', 'reset'])
      .withMessage('Purpose must be login, signup, or reset'),
  ],
  otpController.verifyOTP
);

module.exports = router;
