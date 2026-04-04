const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Donor, User } = require('../models');
const { haversineDistanceKm } = require('../utils/geo');

const searchNearbyDonors = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius || 10);
    const bloodType = req.query.bloodType;
    const eligibleOnly = req.query.eligible !== 'false';

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: 'lat and lng query params are required and must be numbers' });
    }

    const approxLatDelta = radius / 111;
    const approxLngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

    const where = {
      latitude: { [Op.between]: [lat - approxLatDelta, lat + approxLatDelta] },
      longitude: { [Op.between]: [lng - approxLngDelta, lng + approxLngDelta] },
    };

    if (bloodType) {
      where.bloodType = bloodType;
    }

    if (eligibleOnly) {
      where.isEligible = true;
    }

    const candidates = await Donor.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone'] }],
    });

    const results = candidates
      .map((donor) => {
        const distanceKm = haversineDistanceKm(lat, lng, donor.latitude, donor.longitude);
        return {
          ...donor.toJSON(),
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((donor) => donor.distanceKm <= radius)
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

const listDonors = async (req, res, next) => {
  try {
    const donors = await Donor.findAll({
      include: [{ model: User, as: 'user' }],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(donors);
  } catch (error) {
    return next(error);
  }
};

const getMyDonorProfile = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'user' }],
    });

    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    return res.status(200).json(donor);
  } catch (error) {
    return next(error);
  }
};

const getDonorById = async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });

    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    return res.status(200).json(donor);
  } catch (error) {
    return next(error);
  }
};

const createDonor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const donor = await Donor.create(req.body);
    return res.status(201).json(donor);
  } catch (error) {
    return next(error);
  }
};

const updateDonor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const donor = await Donor.findByPk(req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    await donor.update(req.body);
    return res.status(200).json(donor);
  } catch (error) {
    return next(error);
  }
};

const deleteDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    await donor.destroy();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  searchNearbyDonors,
  listDonors,
  getMyDonorProfile,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
};
