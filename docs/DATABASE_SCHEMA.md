# Database Schema

MySQL 8 / MariaDB 10.4+, InnoDB, `utf8mb4_unicode_ci`. All timestamps are stored in **UTC**.
Source of truth: `backend/database/migrations/*.sql` (combined copy in `backend/database/schema.sql`).

## Relationships

```
admins ─┬─< jobs (created_by, updated_by)          ON DELETE SET NULL
        ├─< applications (reviewed_by)             ON DELETE SET NULL
        ├─< gallery (uploaded_by)                  ON DELETE SET NULL
        ├─< website_settings (updated_by)          ON DELETE SET NULL
        └─< audit_logs (admin_id)                  ON DELETE SET NULL

candidates ─< applications >─ jobs                 candidate: CASCADE · job: SET NULL
employers  ─< employer_enquiries                   CASCADE
contact_enquiries                                  (standalone)
```

**Soft delete:** `admins`, `jobs`, `candidates`, `applications`, `employers`, `employer_enquiries`, `contact_enquiries` and `gallery` have a `deleted_at` column. Queries exclude rows where it is set. A deleted job's slug is suffixed (`--deleted-<id>`) so the slug can be reused.

## Tables

### admins
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | |
| name | VARCHAR(120) | |
| email | VARCHAR(190) | UNIQUE |
| password_hash | VARCHAR(255) | bcrypt |
| role | ENUM(super_admin, admin, editor) | indexed |
| is_active | TINYINT(1) | |
| last_login_at | DATETIME NULL | |
| password_changed_at | DATETIME NULL | tokens issued before this are rejected |
| created_at / updated_at / deleted_at | DATETIME | |

### jobs
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | |
| slug | VARCHAR(170) | UNIQUE, SEO URL |
| title | VARCHAR(150) | FULLTEXT (with description) |
| country / city | VARCHAR(80) | country indexed |
| industry | VARCHAR(80) | indexed |
| employment_type | ENUM(full_time, contract, part_time) | |
| experience | VARCHAR(80) | |
| salary | VARCHAR(120) NULL | shown only when entered (verified) |
| vacancies | SMALLINT NULL | shown only when entered (verified) |
| description / requirements / benefits | TEXT | |
| status | ENUM(draft, published, closed) | index (status, deleted_at, published_at) |
| is_featured | TINYINT(1) | |
| application_deadline | DATE NULL | hidden publicly after this date |
| published_at | DATETIME NULL | set the first time the job is published |
| created_by / updated_by | FK → admins | |

### candidates
Personal profile submitted by a job seeker: `full_name`, `mobile` (indexed), `email` (indexed), `qualification`, `experience_years DECIMAL(4,1)`, `current_location`, `preferred_country` + `preferred_category` (composite index), `passport_available`, and CV metadata `cv_path` (random server filename), `cv_original_name`, `cv_mime`, `cv_size`.

### applications
| Column | Type | Notes |
|---|---|---|
| candidate_id | FK → candidates | CASCADE |
| job_id | FK → jobs NULL | NULL = general registration |
| source | ENUM(job_application, registration) | |
| status | ENUM(new, reviewed, shortlisted, rejected, hired) | index (status, deleted_at, created_at) |
| cover_note / admin_notes | TEXT | |
| reviewed_by / reviewed_at | FK → admins / DATETIME | |

### employers
`company_name`, `contact_person`, `email` (UNIQUE — repeat enquiries update the record), `phone`, `country` (indexed), `industry`.

### employer_enquiries
`employer_id` FK, `manpower_requirements TEXT`, `employees_required INT`, `message`, `status ENUM(new, in_progress, closed)`, `admin_notes`, `ip_address`.

### contact_enquiries
`name`, `email`, `phone`, `subject`, `message`, `status ENUM(new, read, replied, archived)`, `ip_address`.

### gallery
`title`, `caption`, `category ENUM(recruitment, workforce, events, office)`, `image_path` (WebP; thumbnail is `thumb-<image_path>`), `width`, `height`, `sort_order`, `is_published`, `uploaded_by`.

### website_settings
Key/value store: `setting_key` (UNIQUE), `setting_value MEDIUMTEXT`, `value_type ENUM(string, text, json, boolean)`, `group_name ENUM(company, content, social, seo)`, `is_public`, `updated_by`.
Default keys are seeded by `npm run seed` with `INSERT IGNORE`, so re-seeding never overwrites admin edits.

### audit_logs
`admin_id`, `action` (login, create, update, delete, status_published, download_cv, …), `entity_type`, `entity_id`, `details JSON`, `ip_address`, `user_agent`, `created_at`.

### schema_migrations
Created by the migration runner: `filename`, `applied_at`.

## Adding a migration
Create `backend/database/migrations/006_<description>.sql` and run `npm run migrate`. Files run once, in name order. Check state with `npm run migrate:status`.
