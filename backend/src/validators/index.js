'use strict';

const Joi = require('joi');
const M = require('../models');

const phone = Joi.string()
  .trim()
  .pattern(/^\+?[0-9][0-9\s-]{6,18}$/)
  .messages({ 'string.pattern.base': 'Enter a valid phone number (digits, spaces, + or -)' });
const email = Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(190);
const text = (max) => Joi.string().trim().max(max);
const id = Joi.number().integer().positive();
const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
};
const optionalText = (max) => text(max).allow('', null).empty('').default(null);

// ---------- Auth ----------
const login = Joi.object({
  email: email.required(),
  password: Joi.string().min(1).max(200).required(),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(10)
    .max(128)
    .pattern(/[A-Za-z]/)
    .pattern(/[0-9]/)
    .invalid(Joi.ref('currentPassword'))
    .required()
    .messages({
      'string.min': 'New password must be at least 10 characters',
      'string.pattern.base': 'New password must contain letters and numbers',
      'any.invalid': 'New password must be different from the current password',
    }),
});

// ---------- Jobs ----------
const jobBody = {
  title: text(150).min(3).required(),
  country: text(80).required(),
  city: optionalText(80),
  industry: text(80).required(),
  employmentType: Joi.string().valid(...M.EMPLOYMENT_TYPES).default('contract'),
  experience: text(80).required(),
  salary: optionalText(120),
  vacancies: Joi.number().integer().min(1).max(10000).allow(null, '').empty('').default(null),
  description: text(10000).min(20).required(),
  requirements: text(10000).min(5).required(),
  benefits: optionalText(5000),
  status: Joi.string().valid(...M.JOB_STATUS).default('draft'),
  isFeatured: Joi.boolean().default(false),
  applicationDeadline: Joi.date().iso().allow(null, '').empty('').default(null),
};
const jobCreate = Joi.object(jobBody);
const jobUpdate = Joi.object(jobBody);
const jobStatus = Joi.object({ status: Joi.string().valid(...M.JOB_STATUS).required() });

const jobPublicQuery = Joi.object({
  ...pagination,
  limit: Joi.number().integer().min(1).max(50).default(12),
  search: text(100).allow(''),
  country: text(80).allow(''),
  industry: text(80).allow(''),
  featured: Joi.boolean(),
});
const jobAdminQuery = Joi.object({
  ...pagination,
  search: text(100).allow(''),
  status: Joi.string().valid(...M.JOB_STATUS, ''),
});

// ---------- Candidates / Applications ----------
// Multipart form: every value arrives as a string; Joi converts types.
const candidateApplication = Joi.object({
  fullName: text(120).min(2).required(),
  mobile: phone.required(),
  email: email.required(),
  qualification: text(120).required(),
  experienceYears: Joi.number().min(0).max(50).precision(1).required(),
  currentLocation: optionalText(120),
  preferredCountry: text(80).required(),
  preferredCategory: text(80).required(),
  passportAvailable: Joi.boolean().allow(null, '').empty('').default(null),
  jobId: id.allow(null, '').empty('').default(null),
  coverNote: optionalText(2000),
  consent: Joi.boolean().valid(true).required().messages({ 'any.only': 'Please confirm your consent to be contacted' }),
});

const applicationQuery = Joi.object({
  ...pagination,
  search: text(100).allow(''),
  status: Joi.string().valid(...M.APPLICATION_STATUS, ''),
  jobId: id.allow(''),
  source: Joi.string().valid('job_application', 'registration', ''),
});
const applicationUpdate = Joi.object({
  status: Joi.string().valid(...M.APPLICATION_STATUS),
  adminNotes: Joi.string().trim().max(5000).allow(''),
}).min(1);

// ---------- Employers ----------
const employerEnquiry = Joi.object({
  companyName: text(160).min(2).required(),
  contactPerson: text(120).min(2).required(),
  email: email.required(),
  phone: phone.required(),
  country: text(80).required(),
  industry: text(80).required(),
  manpowerRequirements: text(5000).min(5).required(),
  employeesRequired: Joi.number().integer().min(1).max(100000).required(),
  message: optionalText(5000),
});
const employerEnquiryQuery = Joi.object({
  ...pagination,
  search: text(100).allow(''),
  status: Joi.string().valid(...M.EMPLOYER_ENQUIRY_STATUS, ''),
});
const employerEnquiryUpdate = Joi.object({
  status: Joi.string().valid(...M.EMPLOYER_ENQUIRY_STATUS),
  adminNotes: Joi.string().trim().max(5000).allow(''),
}).min(1);

// ---------- Contact ----------
const contactEnquiry = Joi.object({
  name: text(120).min(2).required(),
  email: email.required(),
  phone: phone.allow('', null).empty('').default(null),
  subject: text(160).min(2).required(),
  message: text(5000).min(10).required(),
});
const contactQuery = Joi.object({
  ...pagination,
  search: text(100).allow(''),
  status: Joi.string().valid(...M.CONTACT_STATUS, ''),
});
const contactUpdate = Joi.object({ status: Joi.string().valid(...M.CONTACT_STATUS).required() });

// ---------- Gallery ----------
const galleryCreate = Joi.object({
  title: text(150).min(2).required(),
  caption: optionalText(300),
  category: Joi.string().valid(...M.GALLERY_CATEGORIES).default('recruitment'),
  sortOrder: Joi.number().integer().min(-1000).max(1000).default(0),
  isPublished: Joi.boolean().default(true),
});
const galleryUpdate = Joi.object({
  title: text(150).min(2),
  caption: Joi.string().trim().max(300).allow('', null),
  category: Joi.string().valid(...M.GALLERY_CATEGORIES),
  sortOrder: Joi.number().integer().min(-1000).max(1000),
  isPublished: Joi.boolean(),
}).min(1);
const galleryQuery = Joi.object({
  category: Joi.string().valid(...M.GALLERY_CATEGORIES, ''),
});

// ---------- Settings ----------
const settingsUpdate = Joi.object({
  settings: Joi.object()
    .pattern(Joi.string().pattern(/^[a-z0-9_]{2,80}$/), Joi.alternatives(Joi.string().allow('').max(20000), Joi.array(), Joi.object(), Joi.boolean()))
    .min(1)
    .required(),
});

const idParam = Joi.object({ id: id.required() });
const slugParam = Joi.object({ slug: Joi.string().pattern(/^[a-z0-9-]{1,170}$/).required() });

module.exports = {
  login,
  changePassword,
  jobCreate,
  jobUpdate,
  jobStatus,
  jobPublicQuery,
  jobAdminQuery,
  candidateApplication,
  applicationQuery,
  applicationUpdate,
  employerEnquiry,
  employerEnquiryQuery,
  employerEnquiryUpdate,
  contactEnquiry,
  contactQuery,
  contactUpdate,
  galleryCreate,
  galleryUpdate,
  galleryQuery,
  settingsUpdate,
  idParam,
  slugParam,
};
