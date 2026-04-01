const express = require('express');
const { body, param } = require('express-validator');
const donorController = require('../controllers/donorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('admin', 'hospital', 'blood_bank'), donorController.listDonors);
router.get('/me', authorizeRoles('donor', 'admin'), donorController.getMyDonorProfile);
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Donor ID must be a UUID')],
  authorizeRoles('admin', 'hospital', 'blood_bank', 'donor'),
  donorController.getDonorById
);

router.post(
  '/',
  [
    body('userId').isUUID(),
    body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('dateOfBirth').optional().isISO8601(),
    body('lastDonationDate').optional().isISO8601(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('city').optional().isString(),
  ],
  authorizeRoles('admin'),
  donorController.createDonor
);

router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('dateOfBirth').optional().isISO8601(),
    body('lastDonationDate').optional().isISO8601(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('city').optional().isString(),
    body('isEligible').optional().isBoolean(),
  ],
  authorizeRoles('admin', 'donor'),
  donorController.updateDonor
);

router.delete('/:id', [param('id').isUUID()], authorizeRoles('admin'), donorController.deleteDonor);

module.exports = router;
