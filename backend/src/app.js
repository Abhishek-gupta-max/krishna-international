'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimiters');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
if (env.trustProxy) app.set('trust proxy', env.trustProxy);

// Secure HTTP headers. The API serves JSON and gallery images only, so a strict CSP is safe.
app.use(
  helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], imgSrc: ["'self'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow the Angular site to load gallery images
  })
);

app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser clients (no Origin header) and configured origins only.
      if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400,
  })
);

app.use(compression());
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));

if (!env.isTest) {
  app.use(
    morgan(env.isProduction ? 'combined' : 'dev', {
      stream: { write: (msg) => logger.info(msg.trim()) },
      skip: (req) => req.path === '/api/health',
    })
  );
}

// Public gallery images only. CVs are never served statically — they require an authenticated download.
app.use(
  '/uploads/gallery',
  express.static(path.join(env.uploads.root, 'gallery'), {
    maxAge: '30d',
    immutable: true,
    index: false,
    dotfiles: 'deny',
  })
);

app.use('/api', apiLimiter, routes);

app.get('/', (req, res) => res.json({ success: true, message: 'Krishna International Overseas Services API', data: { docs: '/api/health' } }));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
