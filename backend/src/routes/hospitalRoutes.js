const express = require('express');
const { body, param } = require('express-validator');
const hospitalController = require('../controllers/hospitalController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('admin', 'blood_bank', 'hospital'), hospitalController.listHospitals);
router.get('/me', authorizeRoles('admin', 'hospital'), hospitalController.getMyHospitalProfile);
router.get('/:id', [param('id').isUUID()], authorizeRoles('admin', 'hospital', 'blood_bank'), hospitalController.getHospitalById);

router.post(
  '/',
  [
    body('userId').isUUID(),
    body('name').isString().notEmpty(),
    body('address').isString().notEmpty(),
    body('city').optional().isString(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('contactPhone').optional().isString(),
  ],
  authorizeRoles('admin'),
  hospitalController.createHospital
);

router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('name').optional().isString(),
    body('address').optional().isString(),
    body('city').optional().isString(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('contactPhone').optional().isString(),
  ],
  authorizeRoles('admin', 'hospital'),
  hospitalController.updateHospital
);

router.delete('/:id', [param('id').isUUID()], authorizeRoles('admin'), hospitalController.deleteHospital);

module.exports = router;
