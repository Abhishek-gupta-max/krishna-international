'use strict';

const ApiError = require('../utils/ApiError');
const { slugify } = require('../utils/helpers');
const jobRepository = require('../repositories/job.repository');
const { mapJob } = require('../models');

async function uniqueSlug(title, country, excludeId = 0) {
  const base = slugify(`${title} ${country}`) || 'job';
  let slug = base;
  let n = 2;
  while (await jobRepository.slugExists(slug, excludeId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

async function listPublic(filters) {
  const offset = (filters.page - 1) * filters.limit;
  const { rows, total } = await jobRepository.listPublic({ ...filters, offset });
  return { items: rows.map((r) => mapJob(r)), total };
}

async function publicFilters() {
  return jobRepository.publicFilters();
}

async function getPublic(slug) {
  const job = await jobRepository.findPublicBySlug(slug);
  if (!job) throw ApiError.notFound('This vacancy is no longer available.');
  return mapJob(job);
}

async function listAdmin(filters) {
  const offset = (filters.page - 1) * filters.limit;
  const { rows, total } = await jobRepository.listAdmin({ ...filters, offset });
  return { items: rows.map((r) => mapJob(r, { admin: true })), total };
}

async function getAdmin(id) {
  const job = await jobRepository.findById(id);
  if (!job) throw ApiError.notFound('Job not found.');
  return mapJob(job, { admin: true });
}

async function create(data, adminId) {
  const slug = await uniqueSlug(data.title, data.country);
  const id = await jobRepository.create({ ...data, slug }, adminId);
  return getAdmin(id);
}

async function update(id, data, adminId) {
  const existing = await jobRepository.findById(id);
  if (!existing) throw ApiError.notFound('Job not found.');
  const changes = { ...data };
  if (data.title !== existing.title || data.country !== existing.country) {
    changes.slug = await uniqueSlug(data.title, data.country, id);
  }
  await jobRepository.update(id, changes, adminId);
  return getAdmin(id);
}

async function setStatus(id, status, adminId) {
  const existing = await jobRepository.findById(id);
  if (!existing) throw ApiError.notFound('Job not found.');
  await jobRepository.update(id, { status }, adminId);
  return getAdmin(id);
}

async function remove(id, adminId) {
  const existing = await jobRepository.findById(id);
  if (!existing) throw ApiError.notFound('Job not found.');
  await jobRepository.softDelete(id, adminId);
  return { id, title: existing.title };
}

module.exports = { listPublic, publicFilters, getPublic, listAdmin, getAdmin, create, update, setStatus, remove };
