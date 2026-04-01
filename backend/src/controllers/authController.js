const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const config = require('../config/config');
const { User } = require('../models');
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

    const { fullName, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      phone,
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

    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
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
