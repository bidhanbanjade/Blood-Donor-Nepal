const { validationResult } = require('express-validator');
const { BloodBank, Inventory } = require('../models');

const resolveBloodBankIdForRequest = async (req) => {
  if (req.user.role === 'admin' && req.body.bloodBankId) {
    return req.body.bloodBankId;
  }

  const bloodBank = await BloodBank.findOne({ where: { userId: req.user.id } });
  return bloodBank ? bloodBank.id : null;
};

const upsertStock = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bloodBankId = await resolveBloodBankIdForRequest(req);
    if (!bloodBankId) {
      return res.status(400).json({ error: 'No blood bank profile associated with this user' });
    }

    const { bloodType, unitsAvailable } = req.body;

    const [item, created] = await Inventory.findOrCreate({
      where: { bloodBankId, bloodType },
      defaults: { unitsAvailable },
    });

    if (!created) {
      await item.update({ unitsAvailable });
    }

    return res.status(200).json(item);
  } catch (error) {
    return next(error);
  }
};

const listInventory = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.bloodBankId) {
      where.bloodBankId = req.query.bloodBankId;
    }
    if (req.query.bloodType) {
      where.bloodType = req.query.bloodType;
    }

    const items = await Inventory.findAll({ where, order: [['updatedAt', 'DESC']] });
    return res.status(200).json(items);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upsertStock,
  listInventory,
};
