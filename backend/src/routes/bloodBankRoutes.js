const express = require('express');
const bloodBankController = require('../controllers/bloodBankController');
const alertController = require('../controllers/alertController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/search', bloodBankController.searchNearbyBloodBanks);
router.get('/me', authenticateToken, authorizeRoles('blood_bank', 'admin'), bloodBankController.getMyBloodBankProfile);
router.post(
	'/urgent-request',
	authenticateToken,
	authorizeRoles('blood_bank'),
	alertController.triggerAlertValidators,
	alertController.triggerBloodBankUrgentRequest
);

module.exports = router;
