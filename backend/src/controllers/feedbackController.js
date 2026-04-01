const { body, validationResult } = require('express-validator');
const { DonationFeedback, Donor, Donation } = require('../models');

const feedbackValidators = [
  body('donorId').isUUID(),
  body('donationId').optional({ nullable: true }).isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional({ nullable: true }).isString().isLength({ max: 500 }),
];

const createFeedback = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { donorId, donationId, rating, comment } = req.body;

    const donor = await Donor.findByPk(donorId);
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    if (req.user.role === 'donor' && donor.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only submit feedback for your own donor profile' });
    }

    if (donationId) {
      const donation = await Donation.findByPk(donationId);
      if (!donation || donation.donorId !== donorId) {
        return res.status(400).json({ error: 'Donation does not belong to donor profile' });
      }
    }

    const feedback = await DonationFeedback.create({
      donorId,
      donationId: donationId || null,
      rating,
      comment: comment || null,
    });

    return res.status(201).json(feedback);
  } catch (error) {
    return next(error);
  }
};

const listFeedback = async (req, res, next) => {
  try {
    const where = {};

    if (req.query.donorId) {
      where.donorId = req.query.donorId;
    }

    if (req.query.donationId) {
      where.donationId = req.query.donationId;
    }

    const feedback = await DonationFeedback.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(feedback);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  feedbackValidators,
  createFeedback,
  listFeedback,
};
