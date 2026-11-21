'use strict';

const path = require('path');
const winston = require('winston');
const env = require('./env');

const logDir = path.resolve(__dirname, '../../logs');

const logger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'krishna-api' },
  transports: [
    new winston.transports.Console({
      silent: env.isTest,
      format: env.isProduction
        ? winston.format.json()
        : winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

if (!env.isTest) {
  logger.add(new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', maxsize: 5_000_000, maxFiles: 5 }));
  logger.add(new winston.transports.File({ filename: path.join(logDir, 'combined.log'), maxsize: 10_000_000, maxFiles: 5 }));
}

module.exports = logger;
