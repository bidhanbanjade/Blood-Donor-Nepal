const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize, Donor, User } = require('../models');
const { haversineDistanceKm } = require('../utils/geo');

const CITY_COORDS = {
  kathmandu: { lat: 27.7172, lng: 85.324 },
  'kathmandu valley': { lat: 27.7172, lng: 85.324 },
  butwal: { lat: 27.7006, lng: 83.4483 },
  pokhara: { lat: 28.2096, lng: 83.9856 },
  chitwan: { lat: 27.5291, lng: 84.3542 },
};

const getFallbackCoords = (city) => {
  if (!city) return null;
  return CITY_COORDS[String(city).trim().toLowerCase()] || null;
};

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

    const where = {};

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
        const donorCoords =
          donor.latitude != null && donor.longitude != null
            ? { lat: Number(donor.latitude), lng: Number(donor.longitude) }
            : getFallbackCoords(donor.city);

        if (!donorCoords) {
          return null;
        }

        const distanceKm = haversineDistanceKm(lat, lng, donorCoords.lat, donorCoords.lng);
        return {
          ...donor.toJSON(),
          latitude: donorCoords.lat,
          longitude: donorCoords.lng,
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter(Boolean)
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

    if (req.user.role === 'donor' && donor.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own donor profile' });
    }

    await donor.update(req.body);
    return res.status(200).json(donor);
  } catch (error) {
    return next(error);
  }
};

const deleteDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });

    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    await sequelize.transaction(async (transaction) => {
      const userId = donor.userId;
      await donor.destroy({ transaction });

      if (userId) {
        await User.destroy({ where: { id: userId }, transaction });
      }
    });

    return res.status(200).json({
      message: 'Donor removed successfully',
      donorId: donor.id,
      userId: donor.userId,
      deletedUserEmail: donor.user?.email || null,
    });
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
