require('dotenv').config();

const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Donor,
  Hospital,
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

  const hospitalUser = await createOrUpdateUser({
    fullName: 'Demo Hospital',
    email: process.env.SEED_HOSPITAL_EMAIL || 'hospital@example.com',
    role: 'receiver',
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

  console.log('Seed completed.');
  console.log(`Donor login: ${donorUser.email}`);
  console.log(`Hospital login: ${hospitalUser.email}`);
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
