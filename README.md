# Krishna International Overseas Services — Website & Admin Panel

Official website and recruitment management system for **Krishna International Overseas Services**, Gorakhpur, Uttar Pradesh.

| Part | Stack |
|---|---|
| `frontend/` | Angular 19 (standalone components, lazy routes, Reactive Forms, RxJS, signals), SCSS design system |
| `backend/` | Node.js + Express 4, layered architecture (routes → validation → controllers → services → repositories), JWT + bcrypt, Multer, Joi |
| Database | MySQL 8 / MariaDB 10.4+ via `mysql2` (parameterised queries, migrations) |

```
krishna-international/
├── frontend/           Angular application (public site + /admin)
├── backend/            REST API
│   ├── src/            config · controllers · services · repositories · models · routes · middlewares · validators · utils · uploads
│   ├── database/       migrations/ · seeds/ · migrate.js · seed.js · schema.sql
│   └── tests/          Jest + Supertest
└── docs/               API_DOCUMENTATION.md · DATABASE_SCHEMA.md · DEPLOYMENT.md
```

---

## 1. Local setup

### Prerequisites
- Node.js 18+ (tested on Node 24)
- MySQL 8 or MariaDB 10.4+ (XAMPP works)

### Quick start (from the project root)
```bash
npm install          # installs root tooling + backend + frontend
npm run db:setup     # after creating backend/.env (see below)
npm run dev          # API on :4000 and website on :4200 together
```

Or set up each part separately:

### Backend
```bash
cd backend
npm install
cp .env.example .env          # then edit DB_*, JWT_SECRET, SEED_ADMIN_PASSWORD
npm run db:setup              # creates the database, runs migrations, seeds settings + first admin
npm run dev                   # http://localhost:4000  (health check: /api/health)
```

Generate a JWT secret with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend
```bash
cd frontend
npm install
npm start                     # http://localhost:4200
```
The development build calls the API at `http://localhost:4000/api` (see `src/environments/environment.ts`).

### Admin panel
Open **http://localhost:4200/admin/login** and sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
Change the password from **Account → Change password** after the first login, then remove `SEED_ADMIN_PASSWORD` from `.env`.

---

## 2. Features

### Public website
Home · About · Services · Jobs (search, country & industry filters, pagination, shareable URLs) · Job detail with Apply form ·
Employers (Hire Manpower form) · Candidates (registration with CV upload) · Gallery (category filter, lightbox) ·
Contact (Google Map, contact form, WhatsApp) · 404 page · floating WhatsApp button with three prefilled messages.

All company details, the hero text, About content, objectives and testimonials come from the database and are editable in the admin panel.
Testimonials, social links and office hours stay hidden until real values are entered.

### Admin panel (`/admin`)
Dashboard (live counts, 14-day application trend, recent applications/enquiries, activity log) ·
Jobs (create, edit, publish/unpublish, close, delete, featured, deadlines) ·
Applications (search/filter, detail, status & notes, secure CV download) ·
Employer enquiries · Contact messages · Gallery (upload → automatic WebP resize + thumbnail, publish/hide, order) ·
Website content · Company settings · Change password · Sign out.

**Roles:** `super_admin` and `admin` have full access. `editor` can manage jobs and the gallery only and never sees candidate personal data.

---

## 3. Security summary
- bcrypt password hashing (cost 12); constant-time login response for unknown emails
- JWT (HS256) with expiry; changing a password revokes all older tokens
- Role-based access control on every admin route (API and UI)
- Joi validation on every request body/query/param; unknown fields stripped
- Parameterised SQL only; LIKE wildcards escaped
- Uploads: extension + MIME + **magic-byte** checks, random server filenames, size limits; CVs are never publicly served — download requires an admin token
- Gallery images are re-encoded (removes EXIF/GPS metadata)
- Helmet security headers, strict CORS allow-list, rate limits (API, public forms, failed logins)
- Centralised error handler — no stack traces in production responses; Winston logs to `backend/logs/`
- Audit log of admin actions (`audit_logs` table)

---

## 4. Testing
```bash
cd backend && npm test        # validators, file-signature checks, auth & upload guards (no DB needed)
```
During development the full flow was also verified against a real database: 50 API end-to-end checks (job CRUD and publishing, applications with CV upload/download, enquiries, gallery, settings, password change and token revocation) and 15 browser checks of the forms, mobile menu, WhatsApp links and admin route guard.

---

## 5. Content still needed from the company
- **Domain name** — set `SITE_URL` when building (sitemap, robots.txt) and the API host in `frontend/vercel.json`.
- **Gallery photographs** — upload the company's own photos in Admin → Gallery. The stock photographs used on service pages are licensed from Unsplash and are not presented as company events.
- **Testimonials** — add only genuine, consented testimonials in Admin → Website content.
- **Social media links and office hours** — Admin → Company settings.
- **Review all copy** in Admin → Website content and `frontend/src/app/core/models/reference-data.ts` (services, process, “why choose us”).

> **Regulatory note:** The registration shown on the site is a Uttar Pradesh Shop & Establishment registration. The website deliberately does **not** describe it as a recruiting licence. Before recruiting Indian workers for overseas employment, confirm the company's obligations under the Emigration Act, 1983 (Recruiting Agent registration with the Ministry of External Affairs / eMigrate) and update the wording on the site accordingly.

See **docs/DEPLOYMENT.md** for production deployment, **docs/API_DOCUMENTATION.md** for endpoints and **docs/DATABASE_SCHEMA.md** for the data model.
