const jwt = require('jsonwebtoken');
const config = require('../config/config');

const VALID_ROLES = ['donor', 'receiver', 'admin'];

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  const cookieToken = req.cookies ? req.cookies.token : null;
  const token = bearerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  const normalizedRoles = roles.filter((role) => VALID_ROLES.includes(role));

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (normalizedRoles.length === 0) {
      return res.status(500).json({ error: 'No valid roles configured on route' });
    }

    if (!normalizedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};


