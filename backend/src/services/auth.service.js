'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const adminRepository = require('../repositories/admin.repository');
const { mapAdmin } = require('../models');

// Used to keep response time constant when the email does not exist (prevents user enumeration by timing).
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash('timing-equaliser', env.bcryptRounds));

function signToken(admin) {
  return jwt.sign({ sub: admin.id, role: admin.role }, env.jwt.secret, {
    algorithm: 'HS256',
    expiresIn: env.jwt.expiresIn,
  });
}

function decodeExpiry(token) {
  const { exp } = jwt.decode(token);
  return new Date(exp * 1000).toISOString();
}

async function login(email, password) {
  const admin = await adminRepository.findByEmail(email);
  const valid = await bcrypt.compare(password, admin ? admin.password_hash : await getDummyHash());
  if (!admin || !valid) throw ApiError.unauthorized('Incorrect email or password.');
  if (!admin.is_active) throw ApiError.forbidden('This account has been disabled.');

  await adminRepository.touchLastLogin(admin.id);
  const token = signToken(admin);
  return { token, expiresAt: decodeExpiry(token), admin: mapAdmin(admin) };
}

async function me(adminId) {
  const admin = await adminRepository.findById(adminId);
  if (!admin) throw ApiError.notFound('Admin not found.');
  return mapAdmin(admin);
}

async function changePassword(adminId, currentPassword, newPassword) {
  const admin = await adminRepository.findById(adminId);
  if (!admin) throw ApiError.notFound('Admin not found.');
  const valid = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!valid) throw ApiError.unprocessable('Current password is incorrect.', [{ field: 'currentPassword', message: 'Current password is incorrect' }]);

  const hash = await bcrypt.hash(newPassword, env.bcryptRounds);
  await adminRepository.updatePassword(adminId, hash);

  // Issue a fresh token one second after the change so this session stays valid while others are revoked.
  await new Promise((r) => setTimeout(r, 1000));
  const token = signToken(admin);
  return { token, expiresAt: decodeExpiry(token) };
}

module.exports = { login, me, changePassword };
