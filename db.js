const pg = require('pg');
require('dotenv').config();

const client = new pg.Client({
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: 'dev2',
});


module.exports = client
