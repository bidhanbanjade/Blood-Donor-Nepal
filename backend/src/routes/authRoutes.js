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
      .isIn(['donor', 'receiver', 'admin'])
      .withMessage('Role must be donor, receiver, or admin'),
    body('phone').optional().isString(),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.login
);

router.get('/me', authenticateToken, authController.me);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
