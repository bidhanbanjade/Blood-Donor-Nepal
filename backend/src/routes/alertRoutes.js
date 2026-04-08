const express = require('express');
const alertController = require('../controllers/alertController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/public', alertController.listPublicAlerts);

router.get(
  '/history',
  authenticateToken,
  authorizeRoles('admin'),
  alertController.listAlertHistory
);

router.post(
  '/trigger',
  authenticateToken,
  authorizeRoles('admin'),
  alertController.triggerAlertValidators,
  alertController.triggerAlert
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  alertController.deleteAlert
);

router.post('/subscribe', authenticateToken, alertController.subscribePush);

module.exports = router;
