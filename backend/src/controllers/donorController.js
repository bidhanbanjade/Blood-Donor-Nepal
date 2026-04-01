const { validationResult } = require('express-validator');
const { Donor, User } = require('../models');

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
  listDonors,
  getMyDonorProfile,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
};
