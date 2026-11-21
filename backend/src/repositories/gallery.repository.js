'use strict';

const { query } = require('../config/database');

async function listPublic(category) {
  const params = [];
  let sql = 'SELECT * FROM gallery WHERE is_published = 1 AND deleted_at IS NULL';
  if (category) { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY sort_order ASC, created_at DESC LIMIT 200';
  return query(sql, params);
}

async function listAdmin() {
  return query('SELECT * FROM gallery WHERE deleted_at IS NULL ORDER BY sort_order ASC, created_at DESC');
}

async function findById(id) {
  const rows = await query('SELECT * FROM gallery WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
  return rows[0] || null;
}

async function create(data, adminId) {
  const res = await query(
    `INSERT INTO gallery (title, caption, category, image_path, width, height, sort_order, is_published, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.title, data.caption, data.category, data.imagePath, data.width, data.height, data.sortOrder, data.isPublished ? 1 : 0, adminId]
  );
  return res.insertId;
}

async function update(id, data) {
  const map = { title: 'title', caption: 'caption', category: 'category', sortOrder: 'sort_order', isPublished: 'is_published' };
  const sets = [];
  const params = [];
  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) {
      sets.push(`${col} = ?`);
      params.push(key === 'isPublished' ? (data[key] ? 1 : 0) : data[key] === '' ? null : data[key]);
    }
  }
  if (!sets.length) return;
  params.push(id);
  await query(`UPDATE gallery SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`, params);
}

async function softDelete(id) {
  await query('UPDATE gallery SET deleted_at = UTC_TIMESTAMP(), is_published = 0 WHERE id = ? AND deleted_at IS NULL', [id]);
}

module.exports = { listPublic, listAdmin, findById, create, update, softDelete };
