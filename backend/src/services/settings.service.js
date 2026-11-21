'use strict';

const ApiError = require('../utils/ApiError');
const { transaction } = require('../config/database');
const settingsRepository = require('../repositories/settings.repository');

// Short in-memory cache for the public settings payload (requested on every page load).
let publicCache = null;
let publicCacheAt = 0;
const CACHE_MS = 60 * 1000;

function parseValue(row) {
  const v = row.setting_value;
  switch (row.value_type) {
    case 'json':
      try { return JSON.parse(v || 'null'); } catch { return null; }
    case 'boolean':
      return v === '1' || v === 'true';
    default:
      return v ?? '';
  }
}

function serialise(value, type) {
  if (type === 'json') {
    if (typeof value === 'string') {
      try { JSON.parse(value); return value; } catch { throw ApiError.unprocessable('Invalid JSON value.'); }
    }
    return JSON.stringify(value);
  }
  if (type === 'boolean') return value === true || value === 'true' || value === '1' ? '1' : '0';
  if (typeof value !== 'string') throw ApiError.unprocessable('Setting value must be text.');
  return value;
}

async function getPublic() {
  if (publicCache && Date.now() - publicCacheAt < CACHE_MS) return publicCache;
  const rows = await settingsRepository.all({ publicOnly: true });
  publicCache = Object.fromEntries(rows.map((r) => [r.setting_key, parseValue(r)]));
  publicCacheAt = Date.now();
  return publicCache;
}

/** Admin view: grouped with metadata so the UI can render the right input type. */
async function getAll() {
  const rows = await settingsRepository.all();
  const grouped = {};
  for (const r of rows) {
    (grouped[r.group_name] ||= {})[r.setting_key] = { value: parseValue(r), type: r.value_type, updatedAt: r.updated_at };
  }
  return grouped;
}

async function update(settings, adminId) {
  const keys = Object.keys(settings);
  const known = await settingsRepository.findKeys(keys);
  const types = Object.fromEntries(known.map((k) => [k.setting_key, k.value_type]));
  const unknown = keys.filter((k) => !types[k]);
  if (unknown.length) throw ApiError.unprocessable(`Unknown setting(s): ${unknown.join(', ')}`);

  // Validate structured content before saving.
  if (settings.testimonials !== undefined) {
    let list;
    try {
      list = typeof settings.testimonials === 'string' ? JSON.parse(settings.testimonials) : settings.testimonials;
    } catch {
      throw ApiError.unprocessable('Testimonials must be valid JSON.');
    }
    const ok = Array.isArray(list) && list.every((t) => t && typeof t.name === 'string' && t.name.trim() && typeof t.quote === 'string' && t.quote.trim());
    if (!ok) throw ApiError.unprocessable('Each testimonial needs a name and a quote.');
  }
  for (const key of ['whatsapp_number', 'whatsapp_number_alt', 'whatsapp_number_alt2']) {
    if (settings[key] && !/^[0-9]{10,15}$/.test(settings[key])) {
      throw ApiError.unprocessable('WhatsApp number must be digits only, including country code (e.g. 919871962867).');
    }
  }
  for (const key of ['facebook_url', 'instagram_url', 'linkedin_url', 'youtube_url']) {
    const v = settings[key];
    if (v && !/^https:\/\/[^\s]+$/.test(v)) throw ApiError.unprocessable(`${key.replace('_url', '')} link must start with https://`);
  }

  const entries = keys.map((key) => ({ key, value: serialise(settings[key], types[key]) }));
  await transaction((conn) => settingsRepository.updateMany(conn, entries, adminId));
  publicCache = null;
  return getAll();
}

module.exports = { getPublic, getAll, update };
