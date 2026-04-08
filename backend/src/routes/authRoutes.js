const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['donor', 'admin'])
      .withMessage('Role must be donor or admin'),
    body('phone').optional().isString(),
    body('bloodType')
      .optional({ values: 'falsy' })
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Blood type must be one of A+, A-, B+, B-, AB+, AB-, O+, O-'),
    body().custom((_, { req }) => {
      if (req.body.role === 'donor' && !req.body.bloodType) {
        throw new Error('Blood type is required for donor registration');
      }
      return true;
    }),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('Valid email is required'),
    body('phone').optional({ values: 'falsy' }).isString().withMessage('Valid phone is required'),
    body().custom((_, { req }) => {
      if (!req.body.email && !req.body.phone) {
        throw new Error('Email or phone is required');
      }
      return true;
    }),
    body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  ],
  authController.login
);

router.get('/me', authenticateToken, authController.me);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
