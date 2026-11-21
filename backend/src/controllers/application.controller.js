'use strict';

const applicationService = require('../services/application.service');
const audit = require('../services/audit.service');
const { ok, created, paginationMeta } = require('../utils/response');

async function submit(req, res) {
  const result = await applicationService.submit(req.body, req.file);
  created(
    res,
    result,
    req.body.jobId
      ? 'Your application has been received. Our team will contact you if your profile matches the requirement.'
      : 'Your registration has been received. We will contact you when a suitable vacancy is available.'
  );
}

async function list(req, res) {
  const q = req.query;
  const { items, total } = await applicationService.list(q);
  ok(res, items, 'OK', paginationMeta(q.page, q.limit, total));
}

async function get(req, res) {
  ok(res, await applicationService.get(req.params.id));
}

async function update(req, res) {
  const app = await applicationService.update(req.params.id, req.body, req.admin.id);
  await audit.record(req, 'update', 'application', app.id, { status: app.status });
  ok(res, app, 'Application updated');
}

async function remove(req, res) {
  const app = await applicationService.remove(req.params.id);
  await audit.record(req, 'delete', 'application', app.id, { candidate: app.candidate.fullName });
  ok(res, null, 'Application deleted');
}

async function downloadCv(req, res, next) {
  const { filePath, downloadName, mime } = await applicationService.getCvFile(req.params.id);
  await audit.record(req, 'download_cv', 'application', req.params.id);
  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', 'private, no-store');
  res.download(filePath, downloadName, (err) => err && !res.headersSent && next(err));
}

module.exports = { submit, list, get, update, remove, downloadCv };
