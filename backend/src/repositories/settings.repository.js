'use strict';

const { query } = require('../config/database');

async function all({ publicOnly = false } = {}) {
  return query(
    `SELECT setting_key, setting_value, value_type, group_name, is_public, updated_at
     FROM website_settings ${publicOnly ? 'WHERE is_public = 1' : ''} ORDER BY group_name, setting_key`
  );
}

async function findKeys(keys) {
  if (!keys.length) return [];
  return query('SELECT setting_key, value_type FROM website_settings WHERE setting_key IN (?)', [keys]);
}

async function updateMany(conn, entries, adminId) {
  for (const { key, value } of entries) {
    await conn.query('UPDATE website_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?', [value, adminId, key]);
  }
}

module.exports = { all, findKeys, updateMany };
