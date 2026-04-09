const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'app',
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || 'password',
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000,
  max: 20,
});

async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

module.exports = { query };
