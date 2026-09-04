const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_BqxVrc04utOo@ep-plain-frost-a5s3oru3-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
