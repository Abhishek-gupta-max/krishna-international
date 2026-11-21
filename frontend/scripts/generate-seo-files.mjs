/**
 * Generates public/sitemap.xml and public/robots.txt before a production build.
 *
 *   SITE_URL=https://www.example.com  API_URL=https://api.example.com/api  npm run build
 *
 * SITE_URL  – the public website origin (required for absolute sitemap URLs).
 * API_URL   – optional; when set, published job pages are added to the sitemap.
 *
 * Without SITE_URL the script writes a robots.txt without a Sitemap line and skips the sitemap.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const site = (process.env.SITE_URL || '').replace(/\/+$/, '');
const api = (process.env.API_URL || '').replace(/\/+$/, '');

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/services', priority: '0.8', changefreq: 'monthly' },
  { path: '/jobs', priority: '0.9', changefreq: 'daily' },
  { path: '/employers', priority: '0.8', changefreq: 'monthly' },
  { path: '/candidates', priority: '0.8', changefreq: 'monthly' },
  // { path: '/gallery', priority: '0.5', changefreq: 'monthly' }, // hidden from menu
  { path: '/contact', priority: '0.7', changefreq: 'yearly' },
];

const robots = ['User-agent: *', 'Allow: /', 'Disallow: /admin', ''];

if (!site) {
  writeFileSync(resolve(publicDir, 'robots.txt'), robots.join('\n'));
  console.warn('[seo] SITE_URL not set — robots.txt written without a sitemap reference; sitemap.xml skipped.');
  process.exit(0);
}

async function jobUrls() {
  if (!api) return [];
  const urls = [];
  try {
    for (let page = 1; page <= 20; page++) {
      const res = await fetch(`${api}/jobs?limit=50&page=${page}`);
      if (!res.ok) break;
      const body = await res.json();
      for (const j of body.data ?? []) urls.push({ path: `/jobs/${j.slug}`, priority: '0.6', changefreq: 'weekly' });
      if (page >= (body.meta?.totalPages ?? 1)) break;
    }
  } catch (e) {
    console.warn(`[seo] Could not fetch jobs from ${api}: ${e.message}`);
  }
  return urls;
}

const today = new Date().toISOString().slice(0, 10);
const pages = [...staticPages, ...(await jobUrls())];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((p) => `  <url><loc>${site}${p.path}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`)
  .join('\n')}
</urlset>
`;

writeFileSync(resolve(publicDir, 'sitemap.xml'), xml);
writeFileSync(resolve(publicDir, 'robots.txt'), [...robots, `Sitemap: ${site}/sitemap.xml`, ''].join('\n'));
console.log(`[seo] sitemap.xml written with ${pages.length} URLs for ${site}`);
