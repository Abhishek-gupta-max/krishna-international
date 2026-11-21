'use strict';

const router = require('express').Router();
const v = require('../validators');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { formLimiter } = require('../middlewares/rateLimiters');
const { asyncHandler: h } = require('../utils/helpers');
const jobs = require('../controllers/job.controller');
const applications = require('../controllers/application.controller');
const enquiries = require('../controllers/enquiry.controller');
const gallery = require('../controllers/gallery.controller');
const settings = require('../controllers/settings.controller');

router.get('/settings/public', h(settings.getPublic));

router.get('/jobs', validate(v.jobPublicQuery, 'query'), h(jobs.listPublic));
router.get('/jobs/filters', h(jobs.filters));
router.get('/jobs/:slug', validate(v.slugParam, 'params'), h(jobs.getBySlug));

// Candidate registration and job applications (multipart/form-data with optional `cv` file).
router.post('/applications', formLimiter, upload.single('cv', 'cv'), validate(v.candidateApplication), h(applications.submit));

router.post('/employer-enquiries', formLimiter, validate(v.employerEnquiry), h(enquiries.createEmployer));
router.post('/contact', formLimiter, validate(v.contactEnquiry), h(enquiries.createContact));

router.get('/gallery', validate(v.galleryQuery, 'query'), h(gallery.listPublic));

module.exports = router;
