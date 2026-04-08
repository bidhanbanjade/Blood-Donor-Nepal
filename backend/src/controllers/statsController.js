const { Op } = require('sequelize');
const { Alert, Donation, Donor, PublicBloodRequest } = require('../models');

const collectCities = async () => {
  const [donors, requests] = await Promise.all([
    Donor.findAll({ attributes: ['city'], raw: true, where: { city: { [Op.ne]: null } } }),
    PublicBloodRequest.findAll({ attributes: ['city'], raw: true, where: { city: { [Op.ne]: null } } }),
  ]);

  const cities = new Set();

  for (const row of [...donors, ...requests]) {
    if (row.city && String(row.city).trim()) {
      cities.add(String(row.city).trim().toLowerCase());
    }
  }

  return cities.size;
};

const getSummary = async (req, res, next) => {
  try {
    const [registeredDonors, donations, publicRequests, alerts, citiesCovered] = await Promise.all([
      Donor.count(),
      Donation.count(),
      PublicBloodRequest.count(),
      Alert.count({ where: { status: { [Op.in]: ['active', 'sent'] } } }),
      collectCities(),
    ]);

    return res.status(200).json({
      registeredDonors,
      donations,
      publicRequests,
      alerts,
      citiesCovered,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSummary,
};