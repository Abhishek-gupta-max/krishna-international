'use strict';

const ApiError = require('../utils/ApiError');
const { transaction } = require('../config/database');
const employerRepository = require('../repositories/employer.repository');
const contactRepository = require('../repositories/contact.repository');
const { mapEmployerEnquiry, mapContactEnquiry } = require('../models');

// ---------- Employer enquiries ----------
async function createEmployerEnquiry(data, ip) {
  const id = await transaction((conn) => employerRepository.createEnquiry(conn, data, ip));
  return { enquiryId: id };
}

async function listEmployerEnquiries(filters) {
  const offset = (filters.page - 1) * filters.limit;
  const { rows, total } = await employerRepository.list({ ...filters, offset });
  return { items: rows.map(mapEmployerEnquiry), total };
}

async function getEmployerEnquiry(id) {
  const row = await employerRepository.findById(id);
  if (!row) throw ApiError.notFound('Enquiry not found.');
  return mapEmployerEnquiry(row);
}

async function updateEmployerEnquiry(id, data) {
  await getEmployerEnquiry(id);
  await employerRepository.update(id, data);
  return getEmployerEnquiry(id);
}

async function removeEmployerEnquiry(id) {
  const e = await getEmployerEnquiry(id);
  await employerRepository.softDelete(id);
  return e;
}

// ---------- Contact enquiries ----------
async function createContact(data, ip) {
  const id = await contactRepository.create(data, ip);
  return { enquiryId: id };
}

async function listContacts(filters) {
  const offset = (filters.page - 1) * filters.limit;
  const { rows, total } = await contactRepository.list({ ...filters, offset });
  return { items: rows.map(mapContactEnquiry), total };
}

async function getContact(id, { markRead = false } = {}) {
  const row = await contactRepository.findById(id);
  if (!row) throw ApiError.notFound('Message not found.');
  if (markRead && row.status === 'new') {
    await contactRepository.updateStatus(id, 'read');
    row.status = 'read';
  }
  return mapContactEnquiry(row);
}

async function updateContactStatus(id, status) {
  await getContact(id);
  await contactRepository.updateStatus(id, status);
  return getContact(id);
}

async function removeContact(id) {
  const c = await getContact(id);
  await contactRepository.softDelete(id);
  return c;
}

module.exports = {
  createEmployerEnquiry,
  listEmployerEnquiries,
  getEmployerEnquiry,
  updateEmployerEnquiry,
  removeEmployerEnquiry,
  createContact,
  listContacts,
  getContact,
  updateContactStatus,
  removeContact,
};
