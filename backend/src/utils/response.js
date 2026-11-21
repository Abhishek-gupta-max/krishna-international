'use strict';

/**
 * Standard response envelope used by every endpoint:
 * { success: boolean, message: string, data: any, meta?: object, errors?: array }
 */
function ok(res, data = null, message = 'OK', meta) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(200).json(body);
}

function created(res, data = null, message = 'Created successfully') {
  return res.status(201).json({ success: true, message, data });
}

function paginationMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

module.exports = { ok, created, paginationMeta };
