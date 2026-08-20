const rateLimit = require('express-rate-limit');

const createLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
  };

  const config = { ...defaults, ...options };

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    handler: (_req, res) => {
      res.status(429).json(config.message);
    },
  });
};

const globalLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 200 });

const authLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 20 });

const uploadLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 50 });

module.exports = { globalLimiter, authLimiter, uploadLimiter, createLimiter };
