const express = require('express');
const router = express.Router();

// Import route modules (to be created)
// const authRoutes = require('./authRoutes');
// const userRoutes = require('./userRoutes');
// const bloodBankRoutes = require('./bloodBankRoutes');

// Route definitions
router.get('/', (req, res) => {
  res.json({ message: 'Blood Donation Nepal API - Routes' });
});

// Mount route modules
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/blood-banks', bloodBankRoutes);

module.exports = router;

