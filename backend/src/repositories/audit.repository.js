'use strict';

const { query } = require('../config/database');

async function create({ adminId, action, entityType, entityId, details, ip, userAgent }) {
  await query(
    `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [adminId || null, action, entityType, entityId || null, details ? JSON.stringify(details) : null, ip || null, userAgent ? userAgent.slice(0, 255) : null]
  );
}

async function recent(limit = 20) {
  return query(
    `SELECT l.id, l.action, l.entity_type, l.entity_id, l.details, l.created_at, a.name AS admin_name
     FROM audit_logs l LEFT JOIN admins a ON a.id = l.admin_id
     ORDER BY l.created_at DESC, l.id DESC LIMIT ?`,
    [limit]
  );
}

module.exports = { create, recent };
