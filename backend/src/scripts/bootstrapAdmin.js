require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--email') {
      parsed.email = args[i + 1];
      i += 1;
    } else if (arg === '--password') {
      parsed.password = args[i + 1];
      i += 1;
    } else if (arg === '--name') {
      parsed.fullName = args[i + 1];
      i += 1;
    }
  }

  return parsed;
};

const main = async () => {
  const args = parseArgs();
  const email = args.email || process.env.ADMIN_EMAIL;
  const password = args.password || process.env.ADMIN_PASSWORD;
  const fullName = args.fullName || process.env.ADMIN_NAME || 'Platform Admin';

  if (!email || !password) {
    throw new Error('Provide --email and --password (or ADMIN_EMAIL and ADMIN_PASSWORD env vars).');
  }

  if (password.length < 6) {
    throw new Error('Admin password must be at least 6 characters.');
  }

  await sequelize.authenticate();

  const existing = await User.scope('withPassword').findOne({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    await existing.update({
      fullName,
      passwordHash,
      role: 'admin',
      isActive: true,
    });
    console.log(`Updated admin user: ${email}`);
  } else {
    await User.create({
      fullName,
      email,
      passwordHash,
      role: 'admin',
      isActive: true,
    });
    console.log(`Created admin user: ${email}`);
  }
};

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
