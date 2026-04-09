const express = require('express');
const { body } = require('express-validator');
const publicRequestController = require('../controllers/publicRequestController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/public', publicRequestController.listPublicRequests);

router.post(
  '/',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('urgency').isIn(['low', 'medium', 'high', 'critical']),
    body('unitsNeeded').optional().isInt({ min: 1, max: 20 }),
    body('city').optional().isString(),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  ],
  publicRequestController.createPublicRequest
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  publicRequestController.deletePublicRequest
);

module.exports = router;
