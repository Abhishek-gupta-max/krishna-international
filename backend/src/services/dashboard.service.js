'use strict';

const jobRepository = require('../repositories/job.repository');
const applicationRepository = require('../repositories/application.repository');
const employerRepository = require('../repositories/employer.repository');
const contactRepository = require('../repositories/contact.repository');
const auditRepository = require('../repositories/audit.repository');
const { mapApplication, mapEmployerEnquiry } = require('../models');

/** All dashboard figures are computed live from MySQL. */
async function summary() {
  const [jobs, applications, employers, contacts, recentApps, recentEnquiries, daily, activity] = await Promise.all([
    jobRepository.stats(),
    applicationRepository.stats(),
    employerRepository.stats(),
    contactRepository.stats(),
    applicationRepository.recent(6),
    employerRepository.recent(6),
    applicationRepository.dailyCounts(14),
    auditRepository.recent(8),
  ]);

  // Fill missing days with zero so the trend has 14 points.
  const byDay = new Map(daily.map((d) => [new Date(d.day).toISOString().slice(0, 10), Number(d.total)]));
  const trend = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    trend.push({ date: key, count: byDay.get(key) || 0 });
  }

  return {
    totals: {
      totalJobs: jobs.total,
      activeJobs: jobs.active,
      totalApplications: applications.total,
      newApplications: applications.new,
      applicationsLast7Days: applications.last7Days,
      employerEnquiries: employers.total,
      newEmployerEnquiries: employers.new,
      contactMessages: contacts.total,
      newContactMessages: contacts.new,
    },
    applicationTrend: trend,
    recentApplications: recentApps.map(mapApplication),
    recentEnquiries: recentEnquiries.map(mapEmployerEnquiry),
    recentActivity: activity.map((a) => ({
      id: a.id,
      action: a.action,
      entityType: a.entity_type,
      entityId: a.entity_id,
      adminName: a.admin_name,
      createdAt: a.created_at,
    })),
  };
}

module.exports = { summary };
