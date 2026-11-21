'use strict';

const jobService = require('../services/job.service');
const audit = require('../services/audit.service');
const { ok, created, paginationMeta } = require('../utils/response');

// ---- Public ----
async function listPublic(req, res) {
  const q = req.query;
  const { items, total } = await jobService.listPublic(q);
  ok(res, items, 'OK', paginationMeta(q.page, q.limit, total));
}

async function filters(req, res) {
  ok(res, await jobService.publicFilters());
}

async function getBySlug(req, res) {
  ok(res, await jobService.getPublic(req.params.slug));
}

// ---- Admin ----
async function listAdmin(req, res) {
  const q = req.query;
  const { items, total } = await jobService.listAdmin(q);
  ok(res, items, 'OK', paginationMeta(q.page, q.limit, total));
}

async function getById(req, res) {
  ok(res, await jobService.getAdmin(req.params.id));
}

async function create(req, res) {
  const job = await jobService.create(req.body, req.admin.id);
  await audit.record(req, 'create', 'job', job.id, { title: job.title, status: job.status });
  created(res, job, 'Job created');
}

async function update(req, res) {
  const job = await jobService.update(req.params.id, req.body, req.admin.id);
  await audit.record(req, 'update', 'job', job.id, { title: job.title, status: job.status });
  ok(res, job, 'Job updated');
}

async function setStatus(req, res) {
  const job = await jobService.setStatus(req.params.id, req.body.status, req.admin.id);
  await audit.record(req, `status_${job.status}`, 'job', job.id, { title: job.title });
  ok(res, job, job.status === 'published' ? 'Job published' : job.status === 'draft' ? 'Job unpublished' : 'Job closed');
}

async function remove(req, res) {
  const job = await jobService.remove(req.params.id, req.admin.id);
  await audit.record(req, 'delete', 'job', job.id, { title: job.title });
  ok(res, null, 'Job deleted');
}

module.exports = { listPublic, filters, getBySlug, listAdmin, getById, create, update, setStatus, remove };
