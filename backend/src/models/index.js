'use strict';

/**
 * Domain models: enum values shared by validators and repositories,
 * plus mappers that convert MySQL rows into API-facing objects.
 */

const JOB_STATUS = ['draft', 'published', 'closed'];
const EMPLOYMENT_TYPES = ['full_time', 'contract', 'part_time'];
const APPLICATION_STATUS = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'];
const EMPLOYER_ENQUIRY_STATUS = ['new', 'in_progress', 'closed'];
const CONTACT_STATUS = ['new', 'read', 'replied', 'archived'];
const GALLERY_CATEGORIES = ['recruitment', 'workforce', 'events', 'office'];
const ADMIN_ROLES = ['super_admin', 'admin', 'editor'];

const bool = (v) => v === 1 || v === true;
const num = (v) => (v === null || v === undefined ? null : Number(v));

function mapJob(row, { admin = false } = {}) {
  if (!row) return null;
  const job = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    country: row.country,
    city: row.city,
    industry: row.industry,
    employmentType: row.employment_type,
    experience: row.experience,
    salary: row.salary,
    vacancies: num(row.vacancies),
    description: row.description,
    requirements: row.requirements,
    benefits: row.benefits,
    isFeatured: bool(row.is_featured),
    applicationDeadline: row.application_deadline,
    publishedAt: row.published_at,
  };
  if (admin) {
    Object.assign(job, {
      status: row.status,
      applicationsCount: num(row.applications_count) ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
  return job;
}

function mapCandidate(row) {
  if (!row) return null;
  return {
    id: row.candidate_id ?? row.id,
    fullName: row.full_name,
    mobile: row.mobile,
    email: row.email,
    qualification: row.qualification,
    experienceYears: num(row.experience_years),
    currentLocation: row.current_location,
    preferredCountry: row.preferred_country,
    preferredCategory: row.preferred_category,
    passportAvailable: row.passport_available === null ? null : bool(row.passport_available),
    hasCv: Boolean(row.cv_path),
    cvOriginalName: row.cv_original_name,
    cvSize: num(row.cv_size),
  };
}

function mapApplication(row) {
  if (!row) return null;
  return {
    id: row.id,
    source: row.source,
    status: row.status,
    coverNote: row.cover_note,
    adminNotes: row.admin_notes,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    job: row.job_id ? { id: row.job_id, title: row.job_title, country: row.job_country, slug: row.job_slug } : null,
    candidate: mapCandidate(row),
  };
}

function mapEmployerEnquiry(row) {
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    manpowerRequirements: row.manpower_requirements,
    employeesRequired: num(row.employees_required),
    message: row.message,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    employer: {
      id: row.employer_id,
      companyName: row.company_name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      country: row.country,
      industry: row.industry,
    },
  };
}

function mapContactEnquiry(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGalleryItem(row, { admin = false } = {}) {
  if (!row) return null;
  const item = {
    id: row.id,
    title: row.title,
    caption: row.caption,
    category: row.category,
    imageUrl: `/uploads/gallery/${row.image_path}`,
    thumbUrl: `/uploads/gallery/thumb-${row.image_path}`,
    width: num(row.width),
    height: num(row.height),
  };
  if (admin) Object.assign(item, { sortOrder: row.sort_order, isPublished: bool(row.is_published), createdAt: row.created_at });
  return item;
}

function mapAdmin(row) {
  if (!row) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role, lastLoginAt: row.last_login_at };
}

module.exports = {
  JOB_STATUS,
  EMPLOYMENT_TYPES,
  APPLICATION_STATUS,
  EMPLOYER_ENQUIRY_STATUS,
  CONTACT_STATUS,
  GALLERY_CATEGORIES,
  ADMIN_ROLES,
  mapJob,
  mapCandidate,
  mapApplication,
  mapEmployerEnquiry,
  mapContactEnquiry,
  mapGalleryItem,
  mapAdmin,
};
