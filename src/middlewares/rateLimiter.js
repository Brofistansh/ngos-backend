// src/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10);
const maxAttempts = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5', 10);

const loginLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: maxAttempts,
  message: { message: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };
