'use strict';

const authService = require('../services/auth.service');
const audit = require('../services/audit.service');
const { ok } = require('../utils/response');

async function login(req, res) {
  const result = await authService.login(req.body.email, req.body.password);
  req.admin = result.admin;
  await audit.record(req, 'login', 'admin', result.admin.id);
  ok(res, result, 'Signed in successfully');
}

async function me(req, res) {
  ok(res, await authService.me(req.admin.id));
}

async function changePassword(req, res) {
  const result = await authService.changePassword(req.admin.id, req.body.currentPassword, req.body.newPassword);
  await audit.record(req, 'change_password', 'admin', req.admin.id);
  ok(res, result, 'Password updated. Other sessions have been signed out.');
}

async function logout(req, res) {
  await audit.record(req, 'logout', 'admin', req.admin.id);
  ok(res, null, 'Signed out');
}

module.exports = { login, me, changePassword, logout };
