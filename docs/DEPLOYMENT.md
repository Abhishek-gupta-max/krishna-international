# Deployment Guide

Recommended topology:

```
Browser ──► Vercel (Angular static build) ──/api/*, /uploads/gallery/*──► Node API host ──► MySQL
```

The production Angular build calls **relative** URLs (`/api`, `/uploads/gallery`). Vercel rewrites those paths to the API, so the browser sees one origin: no CORS preflights, and the API URL stays out of the bundle.

---

## 1. Database (MySQL 8)

Any managed MySQL works (e.g. your hosting provider's MySQL, AWS RDS, DigitalOcean, Aiven).

1. Create a database and a dedicated user. Do not use root:
   ```sql
   CREATE DATABASE krishna_international CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'krishna_app'@'%' IDENTIFIED BY '<strong-password>';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON krishna_international.* TO 'krishna_app'@'%';
   ```
2. If the provider requires TLS, set `DB_SSL=true`.
3. Run migrations and the seed from the API host or your machine, with production `.env` values:
   ```bash
   cd backend && npm ci && npm run db:setup
   ```

### Backups
Daily logical backup (cron on any machine that can reach the DB):
```bash
mysqldump --single-transaction --routines --triggers -h <host> -u <user> -p krishna_international \
  | gzip > krishna_$(date +%F).sql.gz
```
Back up `backend/src/uploads/` (CVs and gallery images) on the same schedule. CVs are personal data: store backups encrypted and keep only as long as needed.

Restore:
```bash
gunzip < krishna_2026-01-01.sql.gz | mysql -h <host> -u <user> -p krishna_international
```

---

## 2. Backend API (Node.js)

Works on Render, Railway, a VPS with PM2, or any host that runs Node 18+.

**Uploads need persistent disk.** `backend/src/uploads/` holds CVs and gallery images. Use a host with a persistent volume (Render Disk, Railway Volume or a VPS) mounted at that path.

Environment variables (see `backend/.env.example`):

| Variable | Production value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | provided by host |
| `CORS_ORIGINS` | `https://www.your-domain.com,https://your-domain.com` |
| `TRUST_PROXY` | number of proxy hops in front of the API, so rate limits see the real visitor IP: `2` for Vercel → Render/Railway, `1` for Nginx on a VPS, `2` for Vercel → Nginx |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL` | from your MySQL provider |
| `JWT_SECRET` | 64+ random hex chars — **required**; the server refuses to start in production without it |
| `JWT_EXPIRES_IN` | `8h` |
| `SEED_ADMIN_*` | only for the first `npm run seed`, then remove the password |

Commands:
```bash
npm ci --omit=dev
npm run migrate        # on each deploy (idempotent)
npm start              # node src/server.js
```

VPS with PM2:
```bash
pm2 start src/server.js --name krishna-api
pm2 save && pm2 startup
```
Put Nginx in front with HTTPS (Let's Encrypt) and `client_max_body_size 8m;`.

Health check path: `/api/health` (returns 503 if the database is unreachable).

---

## 3. Frontend (Vercel)

1. Import the repository in Vercel and set **Root Directory** to `frontend`.
2. In `frontend/vercel.json`, replace both `https://YOUR-API-HOST` with your API's public URL.
3. Project environment variables:
   - `SITE_URL=https://www.your-domain.com`: used to generate `sitemap.xml` and `robots.txt` at build time.
   - `API_URL=https://YOUR-API-HOST/api` (optional): adds published job pages to the sitemap.
4. Build command `npm run build`, output directory `dist/frontend/browser` (already set in `vercel.json`).
5. Add your custom domain in Vercel and submit `https://www.your-domain.com/sitemap.xml` in Google Search Console.

### Other static hosts
Build locally with `SITE_URL=https://www.your-domain.com npm run build` and upload `dist/frontend/browser/`. Configure:
- a fallback of all unknown paths to `/index.html` (SPA routing);
- a reverse proxy for `/api/*` and `/uploads/gallery/*` to the API.

If you can't proxy, set absolute URLs in `src/environments/environment.prod.ts` (`apiUrl`, `mediaUrl`) and add the website origin to the API's `CORS_ORIGINS`.

---

## 4. Post-deployment checklist
- [ ] `https://www.your-domain.com/api/health` returns `"database": "up"`
- [ ] Sign in at `/admin/login`, change the seeded password, remove `SEED_ADMIN_PASSWORD`
- [ ] Review Admin → Company settings and Website content
- [ ] Upload the company's own photographs in Admin → Gallery
- [ ] Publish a test job, apply with a CV, download the CV in Admin → Applications, then delete both
- [ ] Submit the contact and employer forms once and check that they appear in the admin panel
- [ ] Confirm `robots.txt` and `sitemap.xml` show the real domain
- [ ] Schedule database and uploads backups
