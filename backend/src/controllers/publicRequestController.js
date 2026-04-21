const { validationResult } = require('express-validator');
const { PublicBloodRequest, Donor, User } = require('../models');
const { sendEmailNotification } = require('../services/notificationService');

const notifyMatchingDonors = async ({ bloodType, city, message, fullName, phone, unitsNeeded }) => {
  const donors = await Donor.findAll({
    where: {
      bloodType,
      isEligible: true,
    },
    include: [{ model: User, as: 'user' }],
  });

  let sentEmail = 0;

  for (const donor of donors) {
    if (!donor.user?.email) {
      continue;
    }

    try {
      await sendEmailNotification({
        to: donor.user.email,
        subject: `Public Blood Request: ${bloodType}`,
        text: [
          `A new public blood request for ${bloodType} has been posted.`,
          '',
          `Requester: ${fullName}`,
          `Phone: ${phone}`,
          `City: ${city || 'Not specified'}`,
          `Units needed: ${unitsNeeded || 1}`,
          `Message: ${message}`,
          '',
          'Please log in to the donor dashboard if you can help.',
        ].join('\n'),
      });
      sentEmail += 1;
    } catch (_) {
      // Ignore one-off delivery failures and continue fan-out.
    }
  }

  return { matchedDonors: donors.length, sentEmail };
};

const listPublicRequests = async (req, res, next) => {
  try {
    const requests = await PublicBloodRequest.findAll({
      where: { status: 'open' },
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

    const notifications = await notifyMatchingDonors({
      bloodType,
      city: city?.trim() || null,
      message: message.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      unitsNeeded: unitsNeeded || 1,
    });

    return res.status(201).json({
      message: 'Blood request submitted successfully',
      request,
      notifications,
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
