const { body, validationResult } = require('express-validator');
const {
  Alert,
  BloodBank,
  Donor,
  Hospital,
  PushSubscription,
  User,
} = require('../models');
const { haversineDistanceKm } = require('../utils/geo');
const {
  sendEmailNotification,
  sendPushNotification,
  sendSmsNotification,
} = require('../services/notificationService');

const triggerAlertValidators = [
  body('bloodType').isString().notEmpty(),
  body('urgency').isIn(['low', 'medium', 'high', 'critical']),
  body('message').isString().isLength({ min: 5 }),
  body('radiusKm').optional().isFloat({ min: 1, max: 300 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('hospitalId').optional().isUUID(),
  body('bloodBankId').optional().isUUID(),
];

const findAlertOrigin = async (req) => {
  const { bloodBankId, hospitalId } = req.body;

  if (req.user.role === 'blood_bank') {
    const ownBloodBank = await BloodBank.findOne({ where: { userId: req.user.id } });
    return {
      bloodBankId: ownBloodBank ? ownBloodBank.id : null,
      hospitalId: null,
      latitude: ownBloodBank ? ownBloodBank.latitude : req.body.latitude,
      longitude: ownBloodBank ? ownBloodBank.longitude : req.body.longitude,
    };
  }

  if (req.user.role === 'hospital') {
    const ownHospital = await Hospital.findOne({ where: { userId: req.user.id } });
    return {
      bloodBankId: bloodBankId || null,
      hospitalId: ownHospital ? ownHospital.id : hospitalId || null,
      latitude: ownHospital && ownHospital.latitude ? ownHospital.latitude : req.body.latitude,
      longitude: ownHospital && ownHospital.longitude ? ownHospital.longitude : req.body.longitude,
    };
  }

  return {
    bloodBankId: bloodBankId || null,
    hospitalId: hospitalId || null,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  };
};

const executeAlertFanout = async ({
  createdBy,
  bloodType,
  urgency,
  message,
  radiusKm,
  latitude,
  longitude,
  bloodBankId,
  hospitalId,
}) => {
  const alert = await Alert.create({
    createdBy,
    bloodType,
    urgency,
    message,
    radiusKm: radiusKm || 10,
    latitude,
    longitude,
    bloodBankId,
    hospitalId,
    status: 'active',
  });

  const allDonors = await Donor.findAll({
    where: {
      bloodType,
      isEligible: true,
    },
    include: [{ model: User, as: 'user' }],
  });

  const matchedDonors = allDonors.filter((donor) => {
    if (donor.latitude == null || donor.longitude == null || latitude == null || longitude == null) {
      return false;
    }

    const distance = haversineDistanceKm(
      Number(latitude),
      Number(longitude),
      Number(donor.latitude),
      Number(donor.longitude)
    );

    return distance <= Number(alert.radiusKm);
  });

  let sentPush = 0;
  let sentEmail = 0;
  let sentSms = 0;

  for (const donor of matchedDonors) {
    const payload = {
      title: `Urgent ${alert.bloodType} request`,
      body: alert.message,
      urgency: alert.urgency,
    };

    const subscriptions = await PushSubscription.findAll({ where: { userId: donor.userId } });
    for (const sub of subscriptions) {
      try {
        await sendPushNotification(sub, payload);
        sentPush += 1;
      } catch (_) {
        // Ignore one-off delivery errors and continue fan-out.
      }
    }

    if (donor.user && donor.user.email) {
      try {
        await sendEmailNotification({
          to: donor.user.email,
          subject: `Urgent Blood Request: ${alert.bloodType}`,
          text: alert.message,
        });
        sentEmail += 1;
      } catch (_) {
        // Ignore one-off delivery errors and continue fan-out.
      }
    }

    if (donor.user && donor.user.phone) {
      try {
        await sendSmsNotification({
          to: donor.user.phone,
          message: alert.message,
        });
        sentSms += 1;
      } catch (_) {
        // Ignore one-off delivery errors and continue fan-out.
      }
    }
  }

  await alert.update({ status: 'sent' });

  return {
    alert,
    matchedDonors,
    notifications: {
      push: sentPush,
      email: sentEmail,
      sms: sentSms,
    },
  };
};

const triggerAlert = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const origin = await findAlertOrigin(req);

    const result = await executeAlertFanout({
      createdBy: req.user.id,
      bloodType: req.body.bloodType,
      urgency: req.body.urgency,
      message: req.body.message,
      radiusKm: req.body.radiusKm || 10,
      latitude: origin.latitude,
      longitude: origin.longitude,
      bloodBankId: origin.bloodBankId,
      hospitalId: origin.hospitalId,
    });

    return res.status(200).json({
      message: 'Alert triggered',
      alert: result.alert,
      matchedDonors: result.matchedDonors.length,
      notifications: result.notifications,
    });
  } catch (error) {
    return next(error);
  }
};

const listAlertHistory = async (req, res, next) => {
  try {
    let where = {};

    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ where: { userId: req.user.id } });
      if (!hospital) {
        return res.status(404).json({ error: 'Hospital profile not found' });
      }
      where = { hospitalId: hospital.id };
    }

    if (req.user.role === 'blood_bank') {
      const bloodBank = await BloodBank.findOne({ where: { userId: req.user.id } });
      if (!bloodBank) {
        return res.status(404).json({ error: 'Blood bank profile not found' });
      }
      where = { bloodBankId: bloodBank.id };
    }

    const alerts = await Alert.findAll({
      where,
      include: [
        { model: BloodBank, as: 'bloodBank', attributes: ['id', 'name', 'city'] },
        { model: Hospital, as: 'hospital', attributes: ['id', 'name', 'city'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return res.status(200).json(alerts);
  } catch (error) {
    return next(error);
  }
};

const triggerBloodBankUrgentRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bloodBank = await BloodBank.findOne({ where: { userId: req.user.id } });
    if (!bloodBank) {
      return res.status(404).json({ error: 'Blood bank profile not found' });
    }

    const result = await executeAlertFanout({
      createdBy: req.user.id,
      bloodType: req.body.bloodType,
      urgency: req.body.urgency,
      message: req.body.message,
      radiusKm: req.body.radiusKm || 10,
      latitude: bloodBank.latitude,
      longitude: bloodBank.longitude,
      bloodBankId: bloodBank.id,
      hospitalId: null,
    });

    return res.status(200).json({
      message: 'Urgent blood bank request published',
      alert: result.alert,
      matchedDonors: result.matchedDonors.length,
      notifications: result.notifications,
    });
  } catch (error) {
    return next(error);
  }
};

const subscribePush = async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Invalid push subscription payload' });
    }

    const [subscription] = await PushSubscription.findOrCreate({
      where: { endpoint },
      defaults: {
        userId: req.user.id,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return res.status(201).json(subscription);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  triggerAlertValidators,
  triggerAlert,
  listAlertHistory,
  triggerBloodBankUrgentRequest,
  subscribePush,
};
