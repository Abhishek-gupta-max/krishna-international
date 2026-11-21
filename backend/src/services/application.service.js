'use strict';

const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/ApiError');
const { transaction } = require('../config/database');
const applicationRepository = require('../repositories/application.repository');
const jobRepository = require('../repositories/job.repository');
const { CV_DIR } = require('../middlewares/upload');
const { mapApplication } = require('../models');

/**
 * Create a candidate profile and application. Used for both a general registration
 * (no jobId) and an application to a specific published vacancy.
 */
async function submit(data, file) {
  if (data.jobId) {
    const job = await jobRepository.findPublicById(data.jobId);
    if (!job) throw ApiError.unprocessable('This vacancy is no longer accepting applications.', [{ field: 'jobId', message: 'Vacancy is closed' }]);
  }
  const candidate = {
    ...data,
    cvPath: file ? file.filename : null,
    cvOriginalName: file ? file.originalname.slice(0, 255) : null,
    cvMime: file ? file.mimetype : null,
    cvSize: file ? file.size : null,
  };
  const ids = await transaction((conn) => applicationRepository.createWithCandidate(conn, candidate, data));
  return { applicationId: ids.applicationId };
}

async function list(filters) {
  const offset = (filters.page - 1) * filters.limit;
  const { rows, total } = await applicationRepository.list({ ...filters, offset });
  return { items: rows.map(mapApplication), total };
}

async function get(id) {
  const row = await applicationRepository.findById(id);
  if (!row) throw ApiError.notFound('Application not found.');
  return mapApplication(row);
}

async function update(id, data, adminId) {
  await get(id);
  await applicationRepository.update(id, data, adminId);
  return get(id);
}

async function remove(id) {
  const app = await get(id);
  await applicationRepository.softDelete(id);
  return app;
}

/** Resolve the CV file for download, guarding against path traversal. */
async function getCvFile(id) {
  const row = await applicationRepository.findById(id);
  if (!row) throw ApiError.notFound('Application not found.');
  if (!row.cv_path) throw ApiError.notFound('This candidate did not upload a CV.');

  const filePath = path.resolve(CV_DIR, path.basename(row.cv_path));
  if (!filePath.startsWith(CV_DIR) || !fs.existsSync(filePath)) throw ApiError.notFound('CV file is missing on the server.');

  const ext = path.extname(row.cv_path);
  const safeName = `${row.full_name.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '') || 'candidate'}_CV${ext}`;
  return { filePath, downloadName: safeName, mime: row.cv_mime || 'application/octet-stream' };
}

module.exports = { submit, list, get, update, remove, getCvFile };
