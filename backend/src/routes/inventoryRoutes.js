const express = require('express');
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('admin'), inventoryController.listInventory);

router.post(
  '/',
  [
    body('bloodBankId').optional().isUUID(),
    body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('unitsAvailable').isInt({ min: 0 }),
  ],
  authorizeRoles('admin'),
  inventoryController.upsertStock
);

module.exports = router;
