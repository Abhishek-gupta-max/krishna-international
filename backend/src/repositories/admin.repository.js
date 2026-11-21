'use strict';

const { query } = require('../config/database');

async function findByEmail(email) {
  const rows = await query('SELECT * FROM admins WHERE email = ? AND deleted_at IS NULL LIMIT 1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query('SELECT * FROM admins WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
  return rows[0] || null;
}

async function touchLastLogin(id) {
  await query('UPDATE admins SET last_login_at = UTC_TIMESTAMP() WHERE id = ?', [id]);
}

/** Truncated to whole seconds so it compares cleanly with JWT `iat`. */
async function updatePassword(id, passwordHash) {
  await query('UPDATE admins SET password_hash = ?, password_changed_at = UTC_TIMESTAMP() WHERE id = ?', [passwordHash, id]);
}

module.exports = { findByEmail, findById, touchLastLogin, updatePassword };
