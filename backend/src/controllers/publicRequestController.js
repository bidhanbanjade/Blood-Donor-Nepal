const { validationResult } = require('express-validator');
const { PublicBloodRequest } = require('../models');

const listPublicRequests = async (req, res, next) => {
  try {
    const requests = await PublicBloodRequest.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return res.status(200).json(requests);
  } catch (error) {
    return next(error);
  }
};

const createPublicRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, phone, bloodType, urgency, unitsNeeded, city, message } = req.body;

    const request = await PublicBloodRequest.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      bloodType,
      urgency,
      unitsNeeded: unitsNeeded || 1,
      city: city?.trim() || null,
      message: message.trim(),
    });

    return res.status(201).json({
      message: 'Blood request submitted successfully',
      request,
    });
  } catch (error) {
    return next(error);
  }
};

const deletePublicRequest = async (req, res, next) => {
  try {
    const request = await PublicBloodRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Public blood request not found' });
    }

    await request.destroy();

    return res.status(200).json({
      message: 'Public blood request deleted successfully',
      requestId: request.id,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listPublicRequests,
  createPublicRequest,
  deletePublicRequest,
};
