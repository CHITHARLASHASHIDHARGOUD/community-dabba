const jwt = require('jsonwebtoken');
const env = require('../config/environment');

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '30d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

module.exports = { generateToken, generateRefreshToken, verifyToken };
