const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const config = require('../config/config');
const { User, Donor, sequelize } = require('../models');
const { signUserToken, buildCookieOptions } = require('../utils/authToken');

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  phone: user.phone,
});

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, role, phone, bloodType } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await sequelize.transaction(async (transaction) => {
      const createdUser = await User.create(
        {
          fullName,
          email,
          passwordHash,
          role,
          phone,
        },
        { transaction }
      );

      if (role === 'donor') {
        await Donor.create(
          {
            userId: createdUser.id,
            bloodType,
          },
          { transaction }
        );
      }

      return createdUser;
    });

    const token = signUserToken(user);
    res.cookie(config.authCookieName, token, buildCookieOptions());

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, phone, password } = req.body;

    const whereClause = email ? { email } : { phone };
    const user = await User.scope('withPassword').findOne({ where: whereClause });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role === 'donor') {
      const donorProfile = await Donor.findOne({ where: { userId: user.id } });
      if (!donorProfile) {
        // Backfill for legacy donor accounts created before donor profile auto-creation.
        await Donor.create({
          userId: user.id,
          bloodType: 'O+',
        });
      }
    }

    const token = signUserToken(user);
    res.cookie(config.authCookieName, token, buildCookieOptions());

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    return next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie(config.authCookieName, buildCookieOptions());
  return res.status(200).json({ message: 'Logout successful' });
};

module.exports = {
  register,
  login,
  me,
  logout,
};
