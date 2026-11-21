'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const adminRepository = require('../repositories/admin.repository');

/**
 * Verifies the Bearer token, loads the admin and attaches it to `req.admin`.
 * Tokens issued before the last password change are rejected, so changing the
 * password signs out every other session.
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized();

    let payload;
    try {
      payload = jwt.verify(token, env.jwt.secret, { algorithms: ['HS256'] });
    } catch {
      throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    }

    const admin = await adminRepository.findById(payload.sub);
    if (!admin || !admin.is_active) throw ApiError.unauthorized('Account is not active.');

    if (admin.password_changed_at) {
      const changedAt = Math.floor(new Date(admin.password_changed_at).getTime() / 1000);
      if (payload.iat < changedAt) throw ApiError.unauthorized('Your password was changed. Please sign in again.');
    }

    req.admin = { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
    next();
  } catch (err) {
    next(err);
  }
}

/** Role-based access control: `authorize('super_admin', 'admin')`. */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.admin) return next(ApiError.unauthorized());
    if (roles.length && !roles.includes(req.admin.role)) return next(ApiError.forbidden());
    next();
  };
}

module.exports = { authenticate, authorize };
