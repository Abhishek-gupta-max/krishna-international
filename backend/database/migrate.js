'use strict';

/**
 * Minimal, dependency-free migration runner.
 *  - Creates the database if it does not exist.
 *  - Applies every *.sql file in ./migrations in filename order, once.
 *  - Records applied files in `schema_migrations`.
 *
 * Usage: npm run migrate            # apply pending migrations
 *        npm run migrate:status     # list applied / pending
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function main() {
  const statusOnly = process.argv.includes('--status');
  const base = {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    ssl: env.db.ssl ? { rejectUnauthorized: true } : undefined,
    multipleStatements: true,
  };

  const bootstrap = await mysql.createConnection(base);
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${env.db.database.replace(/`/g, '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrap.end();

  const conn = await mysql.createConnection({ ...base, database: env.db.database });
  await conn.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename VARCHAR(190) NOT NULL PRIMARY KEY,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  const [rows] = await conn.query('SELECT filename FROM schema_migrations');
  const applied = new Set(rows.map((r) => r.filename));
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();

  if (statusOnly) {
    files.forEach((f) => console.log(`${applied.has(f) ? '[applied]' : '[pending]'} ${f}`));
    await conn.end();
    return;
  }

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    process.stdout.write(`Applying ${file} ... `);
    // MySQL DDL auto-commits, so each file should be idempotent-safe or small; we stop at the first failure.
    await conn.query(sql);
    await conn.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
    console.log('done');
    count += 1;
  }

  console.log(count ? `${count} migration(s) applied.` : 'Database is up to date.');
  await conn.end();
}

main().catch((err) => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
