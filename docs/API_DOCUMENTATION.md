# API Documentation

Base URL: `http://localhost:4000/api` (development) — in production `/api` on the website domain (proxied) or your API host.

## Conventions

**Response envelope** (every endpoint):
```json
{ "success": true, "message": "OK", "data": { }, "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 } }
```
`meta` is present on paginated lists only.

**Errors:**
```json
{ "success": false, "message": "Please correct the highlighted fields.", "errors": [{ "field": "email", "message": "email must be a valid email" }] }
```

| Status | Meaning |
|---|---|
| 400 | Malformed request |
| 401 | Missing/expired/revoked token, or wrong credentials |
| 403 | Role not permitted, or origin not allowed by CORS |
| 404 | Not found (also for unpublished/closed jobs on public endpoints) |
| 409 | Duplicate unique value |
| 413 | Body too large |
| 422 | Validation failed (`errors[]` lists fields) |
| 429 | Rate limit exceeded |
| 503 | Database unavailable |

**Authentication:** `Authorization: Bearer <token>` for every `/auth/me`, `/auth/change-password`, `/auth/logout` and `/admin/*` request.

**Rate limits (defaults):** 300 requests / 15 min per IP for the whole API · 20 public form submissions / hour per IP · 10 failed logins / 15 min per IP.

---

## Public endpoints

### `GET /health`
Database connectivity check. `data: { status, database: "up" | "down", uptime }`.

### `GET /settings/public`
Company details and website content. JSON-typed settings (`objectives`, `testimonials`) are returned parsed. Cached for 60 s.

### `GET /jobs`
Published, non-expired vacancies — featured first, then newest.

| Query | Type | Notes |
|---|---|---|
| `page` | int | default 1 |
| `limit` | int | default 12, max 50 |
| `search` | string | title, description, industry |
| `country` | string | exact match |
| `industry` | string | exact match |
| `featured` | boolean | featured only |

### `GET /jobs/filters`
`data: { countries: string[], industries: string[] }` from currently published jobs.

### `GET /jobs/:slug`
One published job. 404 if draft, closed, deleted or past its deadline.

### `POST /applications` — candidate registration / job application
`multipart/form-data`

| Field | Required | Notes |
|---|---|---|
| `fullName` | ✔ | 2–120 chars |
| `mobile` | ✔ | digits, spaces, `+`, `-` |
| `email` | ✔ | |
| `qualification` | ✔ | |
| `experienceYears` | ✔ | 0–50, one decimal |
| `preferredCountry` | ✔ | |
| `preferredCategory` | ✔ | |
| `currentLocation` | | |
| `passportAvailable` | | `true` / `false` |
| `jobId` | | links the application to a published job; omitted = general registration |
| `coverNote` | | max 2000 |
| `consent` | ✔ | must be `true` |
| `cv` | | file: PDF, DOC or DOCX, max 5 MB, content verified by file signature |

`201 → data: { applicationId }`

### `POST /employer-enquiries`
JSON: `companyName*`, `contactPerson*`, `email*`, `phone*`, `country*`, `industry*`, `manpowerRequirements*`, `employeesRequired*` (int ≥ 1), `message`.
Employers are de-duplicated by email (details updated on repeat enquiries). `201 → data: { enquiryId }`

### `POST /contact`
JSON: `name*`, `email*`, `phone`, `subject*`, `message*` (min 10 chars). `201 → data: { enquiryId }`

### `GET /gallery?category=`
Published gallery images. `category`: `recruitment | workforce | events | office`.
Each item: `{ id, title, caption, category, imageUrl, thumbUrl, width, height }` — URLs are relative to the API origin (`/uploads/gallery/...`).

---

## Authentication

### `POST /auth/login`
`{ email, password }` → `data: { token, expiresAt, admin: { id, name, email, role, lastLoginAt } }`

### `GET /auth/me`
Current admin profile.

### `POST /auth/change-password`
`{ currentPassword, newPassword }` — new password: ≥ 10 chars, letters and digits, different from current.
Returns a fresh `{ token, expiresAt }`; all previously issued tokens stop working.

### `POST /auth/logout`
Records the sign-out in the audit log. (Tokens are stateless; the client discards it.)

---

## Admin endpoints (`/admin`, token required)

Roles: **M** = `super_admin`, `admin` · **A** = all roles including `editor`.

| Method & path | Role | Description |
|---|---|---|
| `GET /admin/dashboard` | A | `totals`, `applicationTrend` (14 days), `recentApplications`, `recentEnquiries`, `recentActivity` |
| `GET /admin/jobs?page&limit&search&status` | A | All non-deleted jobs incl. `status`, `applicationsCount` |
| `POST /admin/jobs` | A | Create job (body below) |
| `GET /admin/jobs/:id` | A | One job |
| `PUT /admin/jobs/:id` | A | Replace job fields (slug regenerates if title/country change) |
| `PATCH /admin/jobs/:id/status` | A | `{ status: "draft" \| "published" \| "closed" }` |
| `DELETE /admin/jobs/:id` | M | Soft delete |
| `GET /admin/applications?page&limit&search&status&jobId&source` | M | `source`: `job_application` \| `registration` |
| `GET /admin/applications/:id` | M | Application with candidate and job |
| `PATCH /admin/applications/:id` | M | `{ status?, adminNotes? }`; status: `new, reviewed, shortlisted, rejected, hired` |
| `DELETE /admin/applications/:id` | M | Soft delete |
| `GET /admin/applications/:id/cv` | M | Streams the CV as an attachment |
| `GET /admin/employer-enquiries?page&limit&search&status` | M | |
| `GET /admin/employer-enquiries/:id` | M | |
| `PATCH /admin/employer-enquiries/:id` | M | `{ status?: new \| in_progress \| closed, adminNotes? }` |
| `DELETE /admin/employer-enquiries/:id` | M | Soft delete |
| `GET /admin/contact-enquiries?page&limit&search&status` | M | |
| `GET /admin/contact-enquiries/:id` | M | Marks a `new` message as `read` |
| `PATCH /admin/contact-enquiries/:id` | M | `{ status: new \| read \| replied \| archived }` |
| `DELETE /admin/contact-enquiries/:id` | M | Soft delete |
| `GET /admin/gallery` | A | All images incl. hidden |
| `POST /admin/gallery` | A | multipart: `image*` (JPG/PNG/WEBP ≤ 6 MB), `title*`, `caption`, `category`, `sortOrder`, `isPublished` |
| `PATCH /admin/gallery/:id` | A | `{ title?, caption?, category?, sortOrder?, isPublished? }` |
| `DELETE /admin/gallery/:id` | A | Soft delete + removes image files |
| `GET /admin/settings` | M | Settings grouped: `{ company, content, social, seo }` with `{ value, type, updatedAt }` |
| `PUT /admin/settings` | M | `{ settings: { key: value, ... } }` — only existing keys; social URLs must be `https://` |

**Job body**
```json
{
  "title": "Electrician", "country": "United Arab Emirates", "city": "Dubai",
  "industry": "Construction", "employmentType": "contract",
  "experience": "2–4 years", "salary": null, "vacancies": 10,
  "description": "…", "requirements": "…", "benefits": "…",
  "status": "draft", "isFeatured": false, "applicationDeadline": "2026-12-31"
}
```
`salary` and `vacancies` are optional and should be entered only once confirmed by the employer; they are hidden on the website when empty.

---

## Static files
- `GET /uploads/gallery/<file>.webp` — public gallery images (30-day cache).
- CVs are **not** served statically; use the authenticated CV endpoint.
