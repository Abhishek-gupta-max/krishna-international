'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const toBool = (v, d = false) => (v === undefined ? d : ['1', 'true', 'yes'].includes(String(v).toLowerCase()));
const toInt = (v, d) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : d);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: toInt(process.env.PORT, 4000),
  // 'true' = 1 hop; a number = that many proxy hops (e.g. 2 for Vercel → load balancer → API).
  trustProxy: /^\d+$/.test(process.env.TRUST_PROXY || '') ? Number(process.env.TRUST_PROXY) : toBool(process.env.TRUST_PROXY) ? 1 : 0,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: toInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'krishna_international',
    connectionLimit: toInt(process.env.DB_CONNECTION_LIMIT, 10),
    ssl: toBool(process.env.DB_SSL),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  bcryptRounds: toInt(process.env.BCRYPT_ROUNDS, 12),

  uploads: {
    root: path.resolve(__dirname, '../uploads'),
    maxCvBytes: toInt(process.env.MAX_CV_SIZE_MB, 5) * 1024 * 1024,
    maxImageBytes: toInt(process.env.MAX_IMAGE_SIZE_MB, 6) * 1024 * 1024,
  },

  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MIN, 15) * 60 * 1000,
    max: toInt(process.env.RATE_LIMIT_MAX, 300),
    formMax: toInt(process.env.FORM_RATE_LIMIT_MAX, 20),
    loginMax: toInt(process.env.LOGIN_RATE_LIMIT_MAX, 10),
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};

if (!env.jwt.secret || env.jwt.secret.length < 32) {
  if (env.isProduction) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters in production.');
  }
  env.jwt.secret = 'development-only-secret-do-not-use-in-production-0000';
}

module.exports = env;
