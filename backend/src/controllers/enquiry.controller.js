'use strict';

const enquiryService = require('../services/enquiry.service');
const audit = require('../services/audit.service');
const { ok, created, paginationMeta } = require('../utils/response');

// ---- Employer enquiries ----
async function createEmployer(req, res) {
  const result = await enquiryService.createEmployerEnquiry(req.body, req.ip);
  created(res, result, 'Thank you. Your manpower requirement has been received and our team will contact you shortly.');
}

async function listEmployer(req, res) {
  const q = req.query;
  const { items, total } = await enquiryService.listEmployerEnquiries(q);
  ok(res, items, 'OK', paginationMeta(q.page, q.limit, total));
}

async function getEmployer(req, res) {
  ok(res, await enquiryService.getEmployerEnquiry(req.params.id));
}

async function updateEmployer(req, res) {
  const e = await enquiryService.updateEmployerEnquiry(req.params.id, req.body);
  await audit.record(req, 'update', 'employer_enquiry', e.id, { status: e.status });
  ok(res, e, 'Enquiry updated');
}

async function removeEmployer(req, res) {
  const e = await enquiryService.removeEmployerEnquiry(req.params.id);
  await audit.record(req, 'delete', 'employer_enquiry', e.id, { company: e.employer.companyName });
  ok(res, null, 'Enquiry deleted');
}

// ---- Contact messages ----
async function createContact(req, res) {
  const result = await enquiryService.createContact(req.body, req.ip);
  created(res, result, 'Thank you for contacting us. We will reply as soon as possible.');
}

async function listContact(req, res) {
  const q = req.query;
  const { items, total } = await enquiryService.listContacts(q);
  ok(res, items, 'OK', paginationMeta(q.page, q.limit, total));
}

async function getContact(req, res) {
  ok(res, await enquiryService.getContact(req.params.id, { markRead: true }));
}

async function updateContact(req, res) {
  const c = await enquiryService.updateContactStatus(req.params.id, req.body.status);
  await audit.record(req, 'update', 'contact_enquiry', c.id, { status: c.status });
  ok(res, c, 'Message updated');
}

async function removeContact(req, res) {
  const c = await enquiryService.removeContact(req.params.id);
  await audit.record(req, 'delete', 'contact_enquiry', c.id);
  ok(res, null, 'Message deleted');
}

module.exports = {
  createEmployer,
  listEmployer,
  getEmployer,
  updateEmployer,
  removeEmployer,
  createContact,
  listContact,
  getContact,
  updateContact,
  removeContact,
};
