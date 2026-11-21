'use strict';

const { query } = require('../config/database');
const { likeTerm } = require('../utils/helpers');

async function create(data, ip) {
  const res = await query(
    'INSERT INTO contact_enquiries (name, email, phone, subject, message, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.email, data.phone, data.subject, data.message, ip]
  );
  return res.insertId;
}

async function list({ search, status, limit, offset }) {
  const where = ['deleted_at IS NULL'];
  const params = [];
  if (search) {
    where.push('(name LIKE ? OR email LIKE ? OR subject LIKE ?)');
    const t = likeTerm(search);
    params.push(t, t, t);
  }
  if (status) { where.push('status = ?'); params.push(status); }
  const whereSql = where.join(' AND ');
  const [rows, [{ total }]] = await Promise.all([
    query(`SELECT * FROM contact_enquiries WHERE ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
    query(`SELECT COUNT(*) AS total FROM contact_enquiries WHERE ${whereSql}`, params),
  ]);
  return { rows, total };
}

async function findById(id) {
  const rows = await query('SELECT * FROM contact_enquiries WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
  return rows[0] || null;
}

async function updateStatus(id, status) {
  await query('UPDATE contact_enquiries SET status = ? WHERE id = ? AND deleted_at IS NULL', [status, id]);
}

async function softDelete(id) {
  await query('UPDATE contact_enquiries SET deleted_at = UTC_TIMESTAMP() WHERE id = ? AND deleted_at IS NULL', [id]);
}

async function stats() {
  const [row] = await query("SELECT COUNT(*) AS total, SUM(status = 'new') AS new_count FROM contact_enquiries WHERE deleted_at IS NULL");
  return { total: Number(row.total) || 0, new: Number(row.new_count) || 0 };
}

module.exports = { create, list, findById, updateStatus, softDelete, stats };
