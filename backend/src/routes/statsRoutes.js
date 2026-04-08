const express = require('express');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.get('/summary', statsController.getSummary);

module.exports = router;