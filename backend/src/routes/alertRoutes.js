const express = require('express');
const alertController = require('../controllers/alertController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/trigger',
  authenticateToken,
  authorizeRoles('admin', 'hospital'),
  alertController.triggerAlertValidators,
  alertController.triggerAlert
);

router.post('/subscribe', authenticateToken, alertController.subscribePush);

module.exports = router;
