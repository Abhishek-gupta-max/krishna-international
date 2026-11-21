'use strict';

const { query } = require('../config/database');
const { likeTerm } = require('../utils/helpers');

const SELECT = `
  SELECT ee.*, e.company_name, e.contact_person, e.email, e.phone, e.country, e.industry
  FROM employer_enquiries ee
  JOIN employers e ON e.id = ee.employer_id`;

/** Upsert the employer by email and record the enquiry (inside caller's transaction). */
async function createEnquiry(conn, data, ip) {
  await conn.query(
    `INSERT INTO employers (company_name, contact_person, email, phone, country, industry)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), contact_person = VALUES(contact_person),
       phone = VALUES(phone), country = VALUES(country), industry = VALUES(industry),
       deleted_at = NULL, id = LAST_INSERT_ID(id)`,
    [data.companyName, data.contactPerson, data.email, data.phone, data.country, data.industry]
  );
  const [[{ employerId }]] = await conn.query('SELECT LAST_INSERT_ID() AS employerId');
  const [res] = await conn.query(
    `INSERT INTO employer_enquiries (employer_id, manpower_requirements, employees_required, message, ip_address)
     VALUES (?, ?, ?, ?, ?)`,
    [employerId, data.manpowerRequirements, data.employeesRequired, data.message, ip]
  );
  return res.insertId;
}

async function list({ search, status, limit, offset }) {
  const where = ['ee.deleted_at IS NULL'];
  const params = [];
  if (search) {
    where.push('(e.company_name LIKE ? OR e.contact_person LIKE ? OR e.email LIKE ? OR e.country LIKE ?)');
    const t = likeTerm(search);
    params.push(t, t, t, t);
  }
  if (status) { where.push('ee.status = ?'); params.push(status); }
  const whereSql = where.join(' AND ');
  const [rows, [{ total }]] = await Promise.all([
    query(`${SELECT} WHERE ${whereSql} ORDER BY ee.created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
    query(`SELECT COUNT(*) AS total FROM employer_enquiries ee JOIN employers e ON e.id = ee.employer_id WHERE ${whereSql}`, params),
  ]);
  return { rows, total };
}

async function findById(id) {
  const rows = await query(`${SELECT} WHERE ee.id = ? AND ee.deleted_at IS NULL LIMIT 1`, [id]);
  return rows[0] || null;
}

async function update(id, { status, adminNotes }) {
  const sets = [];
  const params = [];
  if (status !== undefined) { sets.push('status = ?'); params.push(status); }
  if (adminNotes !== undefined) { sets.push('admin_notes = ?'); params.push(adminNotes || null); }
  params.push(id);
  await query(`UPDATE employer_enquiries SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`, params);
}

async function softDelete(id) {
  await query('UPDATE employer_enquiries SET deleted_at = UTC_TIMESTAMP() WHERE id = ? AND deleted_at IS NULL', [id]);
}

async function stats() {
  const [row] = await query(
    "SELECT COUNT(*) AS total, SUM(status = 'new') AS new_count FROM employer_enquiries WHERE deleted_at IS NULL"
  );
  return { total: Number(row.total) || 0, new: Number(row.new_count) || 0 };
}

async function recent(limit = 5) {
  return query(`${SELECT} WHERE ee.deleted_at IS NULL ORDER BY ee.created_at DESC LIMIT ?`, [limit]);
}

module.exports = { createEnquiry, list, findById, update, softDelete, stats, recent };
