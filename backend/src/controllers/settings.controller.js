'use strict';

const settingsService = require('../services/settings.service');
const dashboardService = require('../services/dashboard.service');
const audit = require('../services/audit.service');
const { ok } = require('../utils/response');

async function getPublic(req, res) {
  res.set('Cache-Control', 'public, max-age=60');
  ok(res, await settingsService.getPublic());
}

async function getAll(req, res) {
  ok(res, await settingsService.getAll());
}

async function update(req, res) {
  const result = await settingsService.update(req.body.settings, req.admin.id);
  await audit.record(req, 'update', 'settings', null, { keys: Object.keys(req.body.settings) });
  ok(res, result, 'Settings saved');
}

async function dashboard(req, res) {
  ok(res, await dashboardService.summary());
}

module.exports = { getPublic, getAll, update, dashboard };
