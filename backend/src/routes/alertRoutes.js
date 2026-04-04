const express = require('express');
const alertController = require('../controllers/alertController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/public', alertController.listPublicAlerts);

router.get(
  '/history',
  authenticateToken,
  authorizeRoles('admin', 'hospital', 'blood_bank'),
  alertController.listAlertHistory
);

router.post(
  '/trigger',
  authenticateToken,
  authorizeRoles('admin', 'hospital'),
  alertController.triggerAlertValidators,
  alertController.triggerAlert
);

router.post('/subscribe', authenticateToken, alertController.subscribePush);

module.exports = router;
