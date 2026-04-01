const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('admin', 'donor', 'hospital', 'blood_bank'), feedbackController.listFeedback);
router.post(
  '/',
  authorizeRoles('admin', 'donor'),
  feedbackController.feedbackValidators,
  feedbackController.createFeedback
);

module.exports = router;
