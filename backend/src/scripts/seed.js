require('dotenv').config();

const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Donor,
  BloodBank,
  Hospital,
  Inventory,
  Donation,
} = require('../models');

const createOrUpdateUser = async ({ fullName, email, role, phone, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const [user, created] = await User.scope('withPassword').findOrCreate({
    where: { email },
    defaults: {
      fullName,
      email,
      role,
      phone,
      passwordHash,
      isActive: true,
    },
  });

  if (!created) {
    await user.update({ fullName, role, phone, passwordHash, isActive: true });
  }

  return user;
};

const main = async () => {
  await sequelize.authenticate();

  const donorUser = await createOrUpdateUser({
    fullName: 'Demo Donor',
    email: process.env.SEED_DONOR_EMAIL || 'donor@example.com',
    role: 'donor',
    phone: process.env.SEED_DONOR_PHONE || '+9779800000001',
    password: process.env.SEED_DEFAULT_PASSWORD || 'Password123',
  });

  const bloodBankUser = await createOrUpdateUser({
    fullName: 'Demo Blood Bank',
    email: process.env.SEED_BLOODBANK_EMAIL || 'bloodbank@example.com',
    role: 'blood_bank',
    phone: process.env.SEED_BLOODBANK_PHONE || '+9779800000002',
    password: process.env.SEED_DEFAULT_PASSWORD || 'Password123',
  });

  const hospitalUser = await createOrUpdateUser({
    fullName: 'Demo Hospital',
    email: process.env.SEED_HOSPITAL_EMAIL || 'hospital@example.com',
    role: 'hospital',
    phone: process.env.SEED_HOSPITAL_PHONE || '+9779800000003',
    password: process.env.SEED_DEFAULT_PASSWORD || 'Password123',
  });

  const [donor] = await Donor.findOrCreate({
    where: { userId: donorUser.id },
    defaults: {
      userId: donorUser.id,
      bloodType: 'O+',
      city: 'Kathmandu',
      latitude: 27.7172,
      longitude: 85.324,
      isEligible: true,
    },
  });

  const [bloodBank] = await BloodBank.findOrCreate({
    where: { userId: bloodBankUser.id },
    defaults: {
      userId: bloodBankUser.id,
      name: 'Kathmandu Central Blood Bank',
      address: 'Putalisadak, Kathmandu',
      city: 'Kathmandu',
      latitude: 27.7103,
      longitude: 85.3222,
      contactPhone: '+9779800000002',
      isVerified: true,
    },
  });

  await Hospital.findOrCreate({
    where: { userId: hospitalUser.id },
    defaults: {
      userId: hospitalUser.id,
      name: 'Kathmandu General Hospital',
      address: 'Maitighar, Kathmandu',
      city: 'Kathmandu',
      latitude: 27.6942,
      longitude: 85.3206,
      contactPhone: '+9779800000003',
    },
  });

  const stock = [
    { bloodType: 'O+', unitsAvailable: 20 },
    { bloodType: 'A+', unitsAvailable: 10 },
    { bloodType: 'B+', unitsAvailable: 8 },
    { bloodType: 'AB+', unitsAvailable: 4 },
  ];

  for (const item of stock) {
    const [inventory] = await Inventory.findOrCreate({
      where: { bloodBankId: bloodBank.id, bloodType: item.bloodType },
      defaults: { unitsAvailable: item.unitsAvailable },
    });

    await inventory.update({ unitsAvailable: item.unitsAvailable });
  }

  await Donation.findOrCreate({
    where: {
      donorId: donor.id,
      bloodBankId: bloodBank.id,
      donationDate: '2026-02-01',
    },
    defaults: {
      donorId: donor.id,
      bloodBankId: bloodBank.id,
      bloodType: donor.bloodType,
      donationDate: '2026-02-01',
      unitsDonated: 1,
      notes: 'Seed donation record',
    },
  });

  console.log('Seed completed.');
  console.log(`Donor login: ${donorUser.email}`);
  console.log(`Hospital login: ${hospitalUser.email}`);
  console.log(`Blood bank login: ${bloodBankUser.email}`);
  console.log(`Default password: ${process.env.SEED_DEFAULT_PASSWORD || 'Password123'}`);
};

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
