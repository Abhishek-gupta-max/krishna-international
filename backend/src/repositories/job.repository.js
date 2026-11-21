'use strict';

const { query } = require('../config/database');
const { likeTerm } = require('../utils/helpers');

const PUBLIC_WHERE = "j.status = 'published' AND j.deleted_at IS NULL AND (j.application_deadline IS NULL OR j.application_deadline >= UTC_DATE())";

async function listPublic({ search, country, industry, featured, limit, offset }) {
  const where = [PUBLIC_WHERE];
  const params = [];
  if (search) {
    where.push('(j.title LIKE ? OR j.description LIKE ? OR j.industry LIKE ?)');
    const t = likeTerm(search);
    params.push(t, t, t);
  }
  if (country) { where.push('j.country = ?'); params.push(country); }
  if (industry) { where.push('j.industry = ?'); params.push(industry); }
  if (featured) where.push('j.is_featured = 1');

  const whereSql = where.join(' AND ');
  const [rows, [{ total }]] = await Promise.all([
    query(
      `SELECT j.* FROM jobs j WHERE ${whereSql}
       ORDER BY j.is_featured DESC, j.published_at DESC, j.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) AS total FROM jobs j WHERE ${whereSql}`, params),
  ]);
  return { rows, total };
}

async function publicFilters() {
  const [countries, industries] = await Promise.all([
    query(`SELECT DISTINCT j.country AS value FROM jobs j WHERE ${PUBLIC_WHERE} ORDER BY j.country`),
    query(`SELECT DISTINCT j.industry AS value FROM jobs j WHERE ${PUBLIC_WHERE} ORDER BY j.industry`),
  ]);
  return { countries: countries.map((r) => r.value), industries: industries.map((r) => r.value) };
}

async function findPublicBySlug(slug) {
  const rows = await query(`SELECT j.* FROM jobs j WHERE j.slug = ? AND ${PUBLIC_WHERE} LIMIT 1`, [slug]);
  return rows[0] || null;
}

async function findPublicById(id) {
  const rows = await query(`SELECT j.* FROM jobs j WHERE j.id = ? AND ${PUBLIC_WHERE} LIMIT 1`, [id]);
  return rows[0] || null;
}

async function listAdmin({ search, status, limit, offset }) {
  const where = ['j.deleted_at IS NULL'];
  const params = [];
  if (search) {
    where.push('(j.title LIKE ? OR j.country LIKE ? OR j.industry LIKE ?)');
    const t = likeTerm(search);
    params.push(t, t, t);
  }
  if (status) { where.push('j.status = ?'); params.push(status); }
  const whereSql = where.join(' AND ');

  const [rows, [{ total }]] = await Promise.all([
    query(
      `SELECT j.*,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND a.deleted_at IS NULL) AS applications_count
       FROM jobs j WHERE ${whereSql}
       ORDER BY j.updated_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) AS total FROM jobs j WHERE ${whereSql}`, params),
  ]);
  return { rows, total };
}

async function findById(id) {
  const rows = await query(
    `SELECT j.*,
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND a.deleted_at IS NULL) AS applications_count
     FROM jobs j WHERE j.id = ? AND j.deleted_at IS NULL LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function slugExists(slug, excludeId = 0) {
  const rows = await query('SELECT id FROM jobs WHERE slug = ? AND id <> ? LIMIT 1', [slug, excludeId]);
  return rows.length > 0;
}

const COLUMNS = {
  title: 'title',
  slug: 'slug',
  country: 'country',
  city: 'city',
  industry: 'industry',
  employmentType: 'employment_type',
  experience: 'experience',
  salary: 'salary',
  vacancies: 'vacancies',
  description: 'description',
  requirements: 'requirements',
  benefits: 'benefits',
  status: 'status',
  isFeatured: 'is_featured',
  applicationDeadline: 'application_deadline',
};

function toColumns(data) {
  const cols = [];
  const vals = [];
  for (const [key, col] of Object.entries(COLUMNS)) {
    if (data[key] !== undefined) {
      cols.push(col);
      vals.push(key === 'isFeatured' ? (data[key] ? 1 : 0) : data[key]);
    }
  }
  return { cols, vals };
}

async function create(data, adminId) {
  const { cols, vals } = toColumns(data);
  const publishedAt = data.status === 'published' ? ', published_at' : '';
  const result = await query(
    `INSERT INTO jobs (${cols.join(', ')}, created_by, updated_by${publishedAt})
     VALUES (${cols.map(() => '?').join(', ')}, ?, ?${publishedAt ? ', UTC_TIMESTAMP()' : ''})`,
    [...vals, adminId, adminId]
  );
  return result.insertId;
}

async function update(id, data, adminId) {
  const { cols, vals } = toColumns(data);
  const sets = cols.map((c) => `${c} = ?`);
  sets.push('updated_by = ?');
  // Stamp published_at the first time a job goes live.
  if (data.status === 'published') sets.push('published_at = COALESCE(published_at, UTC_TIMESTAMP())');
  await query(`UPDATE jobs SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`, [...vals, adminId, id]);
}

async function softDelete(id, adminId) {
  // Free the slug so a future job can reuse it.
  await query(
    "UPDATE jobs SET deleted_at = UTC_TIMESTAMP(), status = 'closed', slug = CONCAT(slug, '--deleted-', id), updated_by = ? WHERE id = ? AND deleted_at IS NULL",
    [adminId, id]
  );
}

async function stats() {
  const [row] = await query(
    `SELECT COUNT(*) AS total,
            SUM(status = 'published' AND (application_deadline IS NULL OR application_deadline >= UTC_DATE())) AS active
     FROM jobs WHERE deleted_at IS NULL`
  );
  return { total: Number(row.total) || 0, active: Number(row.active) || 0 };
}

async function sitemapEntries() {
  return query(`SELECT j.slug, j.updated_at FROM jobs j WHERE ${PUBLIC_WHERE} ORDER BY j.published_at DESC LIMIT 1000`);
}

module.exports = {
  listPublic,
  publicFilters,
  findPublicBySlug,
  findPublicById,
  listAdmin,
  findById,
  slugExists,
  create,
  update,
  softDelete,
  stats,
  sitemapEntries,
};
