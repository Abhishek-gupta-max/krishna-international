'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const handler = (message) => (req, res) => res.status(429).json({ success: false, message });

const common = { standardHeaders: 'draft-7', legacyHeaders: false, skip: () => env.isTest };

/** Applied to the whole API. */
const apiLimiter = rateLimit({
  ...common,
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.max,
  handler: handler('Too many requests. Please try again later.'),
});

/** Public form submissions (contact, employer enquiry, candidate registration). */
const formLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: env.rateLimit.formMax,
  handler: handler('You have submitted too many forms. Please try again in an hour or contact us by phone.'),
});

/** Admin login – counts failed attempts only. */
const loginLimiter = rateLimit({
  ...common,
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.loginMax,
  skipSuccessfulRequests: true,
  handler: handler('Too many failed sign-in attempts. Please wait 15 minutes and try again.'),
});

module.exports = { apiLimiter, formLimiter, loginLimiter };
