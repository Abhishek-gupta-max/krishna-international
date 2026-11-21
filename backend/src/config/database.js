'use strict';

const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionLimit: env.db.connectionLimit,
  waitForConnections: true,
  timezone: 'Z',
  charset: 'utf8mb4',
  ssl: env.db.ssl ? { rejectUnauthorized: true } : undefined,
});

// Store and read every DATETIME in UTC so DEFAULT CURRENT_TIMESTAMP and UTC_TIMESTAMP() agree.
pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

/**
 * Run a parameterized query (positional `?` placeholders) and return rows.
 * `pool.query` is used rather than `execute` so LIMIT/OFFSET and IN-lists can be bound safely;
 * mysql2 escapes every bound value, so user input never reaches the SQL text.
 */
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** Execute `fn(conn)` inside a transaction. */
async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, query, transaction };
