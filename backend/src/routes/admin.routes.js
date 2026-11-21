'use strict';

const router = require('express').Router();
const v = require('../validators');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { authenticate, authorize } = require('../middlewares/auth');
const { asyncHandler: h } = require('../utils/helpers');
const jobs = require('../controllers/job.controller');
const applications = require('../controllers/application.controller');
const enquiries = require('../controllers/enquiry.controller');
const gallery = require('../controllers/gallery.controller');
const settings = require('../controllers/settings.controller');

/**
 * Roles
 *  super_admin – everything
 *  admin       – everything
 *  editor      – dashboard, jobs and gallery only (no candidate personal data, no settings)
 */
const ALL = authorize('super_admin', 'admin', 'editor');
const MANAGERS = authorize('super_admin', 'admin');
const id = validate(v.idParam, 'params');

router.use(authenticate);

// Dashboard
router.get('/dashboard', ALL, h(settings.dashboard));

// Jobs
router.get('/jobs', ALL, validate(v.jobAdminQuery, 'query'), h(jobs.listAdmin));
router.post('/jobs', ALL, validate(v.jobCreate), h(jobs.create));
router.get('/jobs/:id', ALL, id, h(jobs.getById));
router.put('/jobs/:id', ALL, id, validate(v.jobUpdate), h(jobs.update));
router.patch('/jobs/:id/status', ALL, id, validate(v.jobStatus), h(jobs.setStatus));
router.delete('/jobs/:id', MANAGERS, id, h(jobs.remove));

// Candidate applications
router.get('/applications', MANAGERS, validate(v.applicationQuery, 'query'), h(applications.list));
router.get('/applications/:id', MANAGERS, id, h(applications.get));
router.patch('/applications/:id', MANAGERS, id, validate(v.applicationUpdate), h(applications.update));
router.delete('/applications/:id', MANAGERS, id, h(applications.remove));
router.get('/applications/:id/cv', MANAGERS, id, h(applications.downloadCv));

// Employer enquiries
router.get('/employer-enquiries', MANAGERS, validate(v.employerEnquiryQuery, 'query'), h(enquiries.listEmployer));
router.get('/employer-enquiries/:id', MANAGERS, id, h(enquiries.getEmployer));
router.patch('/employer-enquiries/:id', MANAGERS, id, validate(v.employerEnquiryUpdate), h(enquiries.updateEmployer));
router.delete('/employer-enquiries/:id', MANAGERS, id, h(enquiries.removeEmployer));

// Contact form submissions
router.get('/contact-enquiries', MANAGERS, validate(v.contactQuery, 'query'), h(enquiries.listContact));
router.get('/contact-enquiries/:id', MANAGERS, id, h(enquiries.getContact));
router.patch('/contact-enquiries/:id', MANAGERS, id, validate(v.contactUpdate), h(enquiries.updateContact));
router.delete('/contact-enquiries/:id', MANAGERS, id, h(enquiries.removeContact));

// Gallery
router.get('/gallery', ALL, h(gallery.listAdmin));
router.post('/gallery', ALL, upload.single('image', 'image', { required: true }), validate(v.galleryCreate), h(gallery.create));
router.patch('/gallery/:id', ALL, id, validate(v.galleryUpdate), h(gallery.update));
router.delete('/gallery/:id', ALL, id, h(gallery.remove));

// Website content & company settings
router.get('/settings', MANAGERS, h(settings.getAll));
router.put('/settings', MANAGERS, validate(v.settingsUpdate), h(settings.update));

module.exports = router;
