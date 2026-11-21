'use strict';

/**
 * Seeds default website settings and, if no admin exists yet, the initial super admin
 * from SEED_ADMIN_* environment variables. Safe to run repeatedly.
 */
const bcrypt = require('bcrypt');
const env = require('../src/config/env');
const { pool } = require('../src/config/database');
const settings = require('./seeds/default-settings');

async function seedSettings() {
  for (const s of settings) {
    await pool.query(
      `INSERT IGNORE INTO website_settings (setting_key, setting_value, value_type, group_name, is_public)
       VALUES (?, ?, ?, ?, ?)`,
      [s.key, s.value, s.type || 'string', s.group, s.public === false ? 0 : 1]
    );
  }
  console.log(`Settings: ${settings.length} default keys ensured.`);
}

async function seedAdmin() {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM admins WHERE deleted_at IS NULL');
  if (total > 0) {
    console.log('Admin: an admin account already exists — skipped.');
    return;
  }
  const email = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '';
  const name = process.env.SEED_ADMIN_NAME || 'Administrator';
  if (!email || password.length < 10) {
    console.warn('Admin: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (min 10 chars) in .env, then run `npm run seed` again.');
    return;
  }
  const hash = await bcrypt.hash(password, env.bcryptRounds);
  await pool.query(
    `INSERT INTO admins (name, email, password_hash, role, password_changed_at) VALUES (?, ?, ?, 'super_admin', NULL)`,
    [name, email, hash]
  );
  console.log(`Admin: super admin created for ${email}. Remove SEED_ADMIN_PASSWORD from .env after first login.`);
}

(async () => {
  try {
    await seedSettings();
    await seedAdmin();
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
