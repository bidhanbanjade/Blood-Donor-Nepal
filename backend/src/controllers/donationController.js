const { validationResult } = require('express-validator');
const { Donation, Donor, BloodBank } = require('../models');

const createDonation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { donorId, bloodBankId, bloodType, donationDate, unitsDonated, notes } = req.body;

    const donor = await Donor.findByPk(donorId);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    const bloodBank = await BloodBank.findByPk(bloodBankId);
    if (!bloodBank) {
      return res.status(404).json({ error: 'Blood bank not found' });
    }

    const donation = await Donation.create({
      donorId,
      bloodBankId,
      bloodType,
      donationDate,
      unitsDonated,
      notes,
    });

    await donor.update({
      lastDonationDate: donationDate,
      isEligible: false,
    });

    return res.status(201).json(donation);
  } catch (error) {
    return next(error);
  }
};

const listDonations = async (req, res, next) => {
  try {
    const where = {};

    if (req.query.donorId) {
      where.donorId = req.query.donorId;
    }
    if (req.query.bloodBankId) {
      where.bloodBankId = req.query.bloodBankId;
    }

    const donations = await Donation.findAll({
      where,
      include: [
        { model: Donor, as: 'donor' },
        { model: BloodBank, as: 'bloodBank' },
      ],
      order: [['donationDate', 'DESC']],
    });

    return res.status(200).json(donations);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createDonation,
  listDonations,
};
