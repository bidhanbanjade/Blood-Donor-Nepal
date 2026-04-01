const { validationResult } = require('express-validator');
const { Hospital, User } = require('../models');

const listHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.findAll({
      include: [{ model: User, as: 'user' }],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(hospitals);
  } catch (error) {
    return next(error);
  }
};

const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    return res.status(200).json(hospital);
  } catch (error) {
    return next(error);
  }
};

const createHospital = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hospital = await Hospital.create(req.body);
    return res.status(201).json(hospital);
  } catch (error) {
    return next(error);
  }
};

const updateHospital = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    await hospital.update(req.body);
    return res.status(200).json(hospital);
  } catch (error) {
    return next(error);
  }
};

const deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    await hospital.destroy();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
};
