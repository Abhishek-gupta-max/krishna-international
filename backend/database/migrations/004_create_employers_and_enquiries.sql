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
