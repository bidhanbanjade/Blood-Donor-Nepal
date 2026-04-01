const express = require('express');
const chatbotController = require('../controllers/chatbotController');

const router = express.Router();

router.get('/agent-card', chatbotController.getAgentCard);
router.post('/task', chatbotController.chatbotValidators, chatbotController.runTask);

module.exports = router;
