const { Op } = require('sequelize');
const { BloodBank, Inventory } = require('../models');
const { haversineDistanceKm } = require('../utils/geo');

const searchNearbyBloodBanks = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius || 10);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: 'lat and lng query params are required and must be numbers' });
    }

    const approxLatDelta = radius / 111;
    const approxLngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

    const candidates = await BloodBank.findAll({
      where: {
        latitude: { [Op.between]: [lat - approxLatDelta, lat + approxLatDelta] },
        longitude: { [Op.between]: [lng - approxLngDelta, lng + approxLngDelta] },
      },
      include: [{ model: Inventory, as: 'inventory' }],
    });

    const results = candidates
      .map((bank) => {
        const distanceKm = haversineDistanceKm(lat, lng, bank.latitude, bank.longitude);
        return {
          ...bank.toJSON(),
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((bank) => bank.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.status(200).json({
      count: results.length,
      radiusKm: radius,
      results,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  searchNearbyBloodBanks,
};
