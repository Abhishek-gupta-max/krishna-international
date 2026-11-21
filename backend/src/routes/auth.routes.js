'use strict';

const router = require('express').Router();
const v = require('../validators');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rateLimiters');
const { asyncHandler: h } = require('../utils/helpers');
const auth = require('../controllers/auth.controller');

router.post('/login', loginLimiter, validate(v.login), h(auth.login));
router.get('/me', authenticate, h(auth.me));
router.post('/change-password', authenticate, validate(v.changePassword), h(auth.changePassword));
router.post('/logout', authenticate, h(auth.logout));

module.exports = router;
