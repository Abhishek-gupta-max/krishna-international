'use strict';

const router = require('express').Router();
const { pool } = require('../config/database');

router.get('/health', async (req, res) => {
  let database = 'up';
  try {
    await pool.query('SELECT 1');
  } catch {
    database = 'down';
  }
  res.status(database === 'up' ? 200 : 503).json({
    success: database === 'up',
    message: database === 'up' ? 'OK' : 'Database unavailable',
    data: { status: 'ok', database, uptime: Math.round(process.uptime()) },
  });
});

router.use('/auth', require('./auth.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/', require('./public.routes'));

module.exports = router;
