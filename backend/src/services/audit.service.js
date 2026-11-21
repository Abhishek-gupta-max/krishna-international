'use strict';

const auditRepository = require('../repositories/audit.repository');
const logger = require('../config/logger');

/**
 * Record an admin action. Failures are logged but never break the request.
 * @param {import('express').Request} req
 */
async function record(req, action, entityType, entityId, details) {
  try {
    await auditRepository.create({
      adminId: req.admin?.id,
      action,
      entityType,
      entityId,
      details,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  } catch (err) {
    logger.error(`Audit log failed: ${err.message}`);
  }
}

module.exports = { record };
