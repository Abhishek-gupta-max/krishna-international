-- Krishna International Overseas Services — full MySQL schema
-- Generated from database/migrations. Prefer 'npm run migrate' which tracks applied migrations.
-- Manual use: mysql -u <user> -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS krishna_international CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE krishna_international;

-- ===== migrations/001_create_admins.sql =====
-- Administrators who can sign in to the admin panel.
CREATE TABLE admins (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name                 VARCHAR(120) NOT NULL,
  email                VARCHAR(190) NOT NULL,
  password_hash        VARCHAR(255) NOT NULL,
  role                 ENUM('super_admin', 'admin', 'editor') NOT NULL DEFAULT 'admin',
  is_active            TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at        DATETIME NULL,
  password_changed_at  DATETIME NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at           DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email),
  KEY idx_admins_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== migrations/002_create_jobs.sql =====
-- Vacancies published on the public website.
-- salary and vacancies are nullable: they are shown publicly only when the employer has confirmed them.
CREATE TABLE jobs (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(170) NOT NULL,
  title            VARCHAR(150) NOT NULL,
  country          VARCHAR(80)  NOT NULL,
  city             VARCHAR(80)  NULL,
  industry         VARCHAR(80)  NOT NULL,
  employment_type  ENUM('full_time', 'contract', 'part_time') NOT NULL DEFAULT 'contract',
  experience       VARCHAR(80)  NOT NULL,
  salary           VARCHAR(120) NULL,
  vacancies        SMALLINT UNSIGNED NULL,
  description      TEXT NOT NULL,
  requirements     TEXT NOT NULL,
  benefits         TEXT NULL,
  status           ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
  is_featured      TINYINT(1) NOT NULL DEFAULT 0,
  application_deadline DATE NULL,
  published_at     DATETIME NULL,
  created_by       INT UNSIGNED NULL,
  updated_by       INT UNSIGNED NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at       DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_jobs_slug (slug),
  KEY idx_jobs_status_published (status, deleted_at, published_at),
  KEY idx_jobs_country (country),
  KEY idx_jobs_industry (industry),
  FULLTEXT KEY ft_jobs_search (title, description),
  CONSTRAINT fk_jobs_created_by FOREIGN KEY (created_by) REFERENCES admins (id) ON DELETE SET NULL,
  CONSTRAINT fk_jobs_updated_by FOREIGN KEY (updated_by) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== migrations/003_create_candidates_and_applications.sql =====
-- A candidate is a person; an application links a candidate to a job (or is a general registration when job_id is NULL).
CREATE TABLE candidates (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name           VARCHAR(120) NOT NULL,
  mobile              VARCHAR(20)  NOT NULL,
  email               VARCHAR(190) NOT NULL,
  qualification       VARCHAR(120) NOT NULL,
  experience_years    DECIMAL(4,1) NOT NULL DEFAULT 0,
  current_location    VARCHAR(120) NULL,
  preferred_country   VARCHAR(80)  NOT NULL,
  preferred_category  VARCHAR(80)  NOT NULL,
  passport_available  TINYINT(1)   NULL,
  cv_path             VARCHAR(255) NULL,
  cv_original_name    VARCHAR(255) NULL,
  cv_mime             VARCHAR(120) NULL,
  cv_size             INT UNSIGNED NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_candidates_email (email),
  KEY idx_candidates_mobile (mobile),
  KEY idx_candidates_pref (preferred_country, preferred_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE applications (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  candidate_id  INT UNSIGNED NOT NULL,
  job_id        INT UNSIGNED NULL,
  source        ENUM('job_application', 'registration') NOT NULL DEFAULT 'registration',
  status        ENUM('new', 'reviewed', 'shortlisted', 'rejected', 'hired') NOT NULL DEFAULT 'new',
  cover_note    TEXT NULL,
  admin_notes   TEXT NULL,
  reviewed_by   INT UNSIGNED NULL,
  reviewed_at   DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_applications_status (status, deleted_at, created_at),
  KEY idx_applications_job (job_id),
  KEY idx_applications_candidate (candidate_id),
  CONSTRAINT fk_applications_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE SET NULL,
  CONSTRAINT fk_applications_reviewer FOREIGN KEY (reviewed_by) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== migrations/004_create_employers_and_enquiries.sql =====
-- Employers are de-duplicated by email; each manpower request is stored as an enquiry.
CREATE TABLE employers (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_name    VARCHAR(160) NOT NULL,
  contact_person  VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL,
  phone           VARCHAR(30)  NOT NULL,
  country         VARCHAR(80)  NOT NULL,
  industry        VARCHAR(80)  NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_employers_email (email),
  KEY idx_employers_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE employer_enquiries (
  id                     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  employer_id            INT UNSIGNED NOT NULL,
  manpower_requirements  TEXT NOT NULL,
  employees_required     INT UNSIGNED NOT NULL,
  message                TEXT NULL,
  status                 ENUM('new', 'in_progress', 'closed') NOT NULL DEFAULT 'new',
  admin_notes            TEXT NULL,
  ip_address             VARCHAR(45) NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at             DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_employer_enquiries_status (status, deleted_at, created_at),
  KEY idx_employer_enquiries_employer (employer_id),
  CONSTRAINT fk_employer_enquiries_employer FOREIGN KEY (employer_id) REFERENCES employers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contact_enquiries (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(190) NOT NULL,
  phone       VARCHAR(30)  NULL,
  subject     VARCHAR(160) NOT NULL,
  message     TEXT NOT NULL,
  status      ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_contact_enquiries_status (status, deleted_at, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== migrations/005_create_gallery_settings_audit.sql =====
CREATE TABLE gallery (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title         VARCHAR(150) NOT NULL,
  caption       VARCHAR(300) NULL,
  category      ENUM('recruitment', 'workforce', 'events', 'office') NOT NULL DEFAULT 'recruitment',
  image_path    VARCHAR(255) NOT NULL,
  width         SMALLINT UNSIGNED NULL,
  height        SMALLINT UNSIGNED NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  is_published  TINYINT(1) NOT NULL DEFAULT 1,
  uploaded_by   INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_gallery_public (is_published, deleted_at, sort_order),
  KEY idx_gallery_category (category),
  CONSTRAINT fk_gallery_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Key/value store for company details and editable website content.
-- is_public controls whether the key is returned by the unauthenticated /settings/public endpoint.
CREATE TABLE website_settings (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key    VARCHAR(80) NOT NULL,
  setting_value  MEDIUMTEXT NULL,
  value_type     ENUM('string', 'text', 'json', 'boolean') NOT NULL DEFAULT 'string',
  group_name     ENUM('company', 'content', 'social', 'seo') NOT NULL DEFAULT 'company',
  is_public      TINYINT(1) NOT NULL DEFAULT 1,
  updated_by     INT UNSIGNED NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key (setting_key),
  KEY idx_settings_group (group_name),
  CONSTRAINT fk_settings_updated_by FOREIGN KEY (updated_by) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id     INT UNSIGNED NULL,
  action       VARCHAR(60) NOT NULL,
  entity_type  VARCHAR(60) NOT NULL,
  entity_id    INT UNSIGNED NULL,
  details      JSON NULL,
  ip_address   VARCHAR(45) NULL,
  user_agent   VARCHAR(255) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_admin (admin_id, created_at),
  KEY idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

