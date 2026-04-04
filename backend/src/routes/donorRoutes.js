const express = require('express');
const { body, param, query } = require('express-validator');
const donorController = require('../controllers/donorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/search/nearby',
  [
    query('lat').isFloat({ min: -90, max: 90 }),
    query('lng').isFloat({ min: -180, max: 180 }),
    query('radius').optional().isFloat({ min: 1, max: 300 }),
    query('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    query('eligible').optional().isIn(['true', 'false']),
  ],
  donorController.searchNearbyDonors
);

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
