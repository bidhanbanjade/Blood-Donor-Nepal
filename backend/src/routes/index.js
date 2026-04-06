const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const otpRoutes = require('./otpRoutes');
const donorRoutes = require('./donorRoutes');
const hospitalRoutes = require('./hospitalRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const donationRoutes = require('./donationRoutes');
const bloodBankRoutes = require('./bloodBankRoutes');
const alertRoutes = require('./alertRoutes');
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
router.use('/hospitals', hospitalRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/donations', donationRoutes);
router.use('/blood-banks', bloodBankRoutes);
router.use('/alerts', alertRoutes);
router.use('/alert', alertRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/feedback', feedbackRoutes);

module.exports = router;


