const express = require('express');
const { body } = require('express-validator');
const donationController = require('../controllers/donationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('admin', 'donor'), donationController.listDonations);

router.post(
  '/self',
  [
    body('alertId').optional().isUUID(),
  ],
  authorizeRoles('donor'),
  donationController.createSelfDonation
);

router.post(
  '/',
  [
    body('donorId').isUUID(),
    body('bloodBankId').isUUID(),
    body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('donationDate').isISO8601(),
    body('unitsDonated').optional().isInt({ min: 1 }),
    body('notes').optional().isString(),
  ],
  authorizeRoles('admin'),
  donationController.createDonation
);

module.exports = router;
