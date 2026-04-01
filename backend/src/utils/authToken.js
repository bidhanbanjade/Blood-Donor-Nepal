const jwt = require('jsonwebtoken');
const config = require('../config/config');

const signUserToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

const buildCookieOptions = () => ({
  httpOnly: true,
  secure: config.authCookieSecure,
  sameSite: config.authCookieSameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

module.exports = {
  signUserToken,
  buildCookieOptions,
};
