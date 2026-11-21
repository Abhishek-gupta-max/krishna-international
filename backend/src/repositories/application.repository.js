'use strict';

const { query } = require('../config/database');
const { likeTerm } = require('../utils/helpers');

const SELECT = `
  SELECT a.*, c.id AS candidate_id, c.full_name, c.mobile, c.email, c.qualification, c.experience_years,
         c.current_location, c.preferred_country, c.preferred_category, c.passport_available,
         c.cv_path, c.cv_original_name, c.cv_mime, c.cv_size,
         j.title AS job_title, j.country AS job_country, j.slug AS job_slug
  FROM applications a
  JOIN candidates c ON c.id = a.candidate_id
  LEFT JOIN jobs j ON j.id = a.job_id`;

/** Insert candidate + application in one transaction (conn provided by caller). */
async function createWithCandidate(conn, candidate, application) {
  const [cRes] = await conn.query(
    `INSERT INTO candidates
      (full_name, mobile, email, qualification, experience_years, current_location, preferred_country,
       preferred_category, passport_available, cv_path, cv_original_name, cv_mime, cv_size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      candidate.fullName,
      candidate.mobile,
      candidate.email,
      candidate.qualification,
      candidate.experienceYears,
      candidate.currentLocation,
      candidate.preferredCountry,
      candidate.preferredCategory,
      candidate.passportAvailable === null ? null : candidate.passportAvailable ? 1 : 0,
      candidate.cvPath,
      candidate.cvOriginalName,
      candidate.cvMime,
      candidate.cvSize,
    ]
  );
  const [aRes] = await conn.query(
    'INSERT INTO applications (candidate_id, job_id, source, cover_note) VALUES (?, ?, ?, ?)',
    [cRes.insertId, application.jobId, application.jobId ? 'job_application' : 'registration', application.coverNote]
  );
  return { candidateId: cRes.insertId, applicationId: aRes.insertId };
}

async function list({ search, status, jobId, source, limit, offset }) {
  const where = ['a.deleted_at IS NULL', 'c.deleted_at IS NULL'];
  const params = [];
  if (search) {
    where.push('(c.full_name LIKE ? OR c.email LIKE ? OR c.mobile LIKE ? OR c.preferred_category LIKE ?)');
    const t = likeTerm(search);
    params.push(t, t, t, t);
  }
  if (status) { where.push('a.status = ?'); params.push(status); }
  if (jobId) { where.push('a.job_id = ?'); params.push(jobId); }
  if (source) { where.push('a.source = ?'); params.push(source); }
  const whereSql = where.join(' AND ');

  const [rows, [{ total }]] = await Promise.all([
    query(`${SELECT} WHERE ${whereSql} ORDER BY a.created_at DESC, a.id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
    query(`SELECT COUNT(*) AS total FROM applications a JOIN candidates c ON c.id = a.candidate_id WHERE ${whereSql}`, params),
  ]);
  return { rows, total };
}

async function findById(id) {
  const rows = await query(`${SELECT} WHERE a.id = ? AND a.deleted_at IS NULL LIMIT 1`, [id]);
  return rows[0] || null;
}

async function update(id, { status, adminNotes }, adminId) {
  const sets = [];
  const params = [];
  if (status !== undefined) { sets.push('status = ?'); params.push(status); }
  if (adminNotes !== undefined) { sets.push('admin_notes = ?'); params.push(adminNotes || null); }
  sets.push('reviewed_by = ?', 'reviewed_at = UTC_TIMESTAMP()');
  params.push(adminId, id);
  await query(`UPDATE applications SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`, params);
}

async function softDelete(id) {
  await query('UPDATE applications SET deleted_at = UTC_TIMESTAMP() WHERE id = ? AND deleted_at IS NULL', [id]);
}

async function stats() {
  const [row] = await query(
    `SELECT COUNT(*) AS total, SUM(status = 'new') AS new_count,
            SUM(created_at >= UTC_TIMESTAMP() - INTERVAL 7 DAY) AS last7
     FROM applications WHERE deleted_at IS NULL`
  );
  return { total: Number(row.total) || 0, new: Number(row.new_count) || 0, last7Days: Number(row.last7) || 0 };
}

async function recent(limit = 5) {
  return query(`${SELECT} WHERE a.deleted_at IS NULL ORDER BY a.created_at DESC LIMIT ?`, [limit]);
}

/** Applications per day for the last `days` days (for the dashboard trend). */
async function dailyCounts(days = 14) {
  return query(
    `SELECT DATE(created_at) AS day, COUNT(*) AS total FROM applications
     WHERE deleted_at IS NULL AND created_at >= UTC_DATE() - INTERVAL ? DAY
     GROUP BY DATE(created_at) ORDER BY day`,
    [days - 1]
  );
}

module.exports = { createWithCandidate, list, findById, update, softDelete, stats, recent, dailyCounts };
