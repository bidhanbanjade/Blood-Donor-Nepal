const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const otpRoutes = require('./otpRoutes');
const donorRoutes = require('./donorRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const donationRoutes = require('./donationRoutes');
const alertRoutes = require('./alertRoutes');
const publicRequestRoutes = require('./publicRequestRoutes');
const statsRoutes = require('./statsRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const feedbackRoutes = require('./feedbackRoutes');

// Route definitions
router.get('/', (req, res) => {
  res.json({ message: 'Blood Donation Nepal API' });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/otp', otpRoutes);
router.use('/donors', donorRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/donations', donationRoutes);
router.use('/alerts', alertRoutes);
router.use('/alert', alertRoutes);
router.use('/public-requests', publicRequestRoutes);
router.use('/stats', statsRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/feedback', feedbackRoutes);

module.exports = router;


