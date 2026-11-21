'use strict';

const logger = require('../config/logger');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { discard } = require('./upload');

function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
async function errorHandler(err, req, res, next) {
  // Never keep a file whose request failed.
  if (req.file) await discard(req.file);

  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.details;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  } else if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'A record with the same unique value already exists.';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    status = 503;
    message = 'Service temporarily unavailable. Please try again shortly.';
  } else if (err.message === 'Not allowed by CORS') {
    status = 403;
  }

  if (status >= 500) {
    logger.error(err.message, { stack: err.stack, method: req.method, url: req.originalUrl });
    if (env.isProduction && !(err instanceof ApiError)) message = 'Internal server error';
  } else {
    logger.warn(`${status} ${req.method} ${req.originalUrl} – ${message}`);
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
