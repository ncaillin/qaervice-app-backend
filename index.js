const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const owner = require('./routes/owner');
const misc = require('./routes/misc');
const employee = require('./routes/employee');
const customer = require('./routes/customer');
const job = require('./routes/job')
const client = require('./utils/db');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const TWO_HOURS = 1000 * 60 * 60 * 2

const {
  SESS_LIFETIME = TWO_HOURS,
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_SECRET = '123456',
  SESS_TABLE_NAME = 'devSessions',
  CORS_ORIGIN = 'http://localhost:3000'
} = process.env

const IN_PROD = NODE_ENV === 'production'


const app = express();

const pool = new pg.Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})




app.use(cors({origin: CORS_ORIGIN, credentials: true}));
app.use(session({
  name: SESS_NAME,
  store: new pgSession({
    pool: pool,
    tableName: SESS_TABLE_NAME,
    createTableIfMissing: true
  }),
  resave: false,
  secret: SESS_SECRET,
  saveUninitialized: false,
  cookie: {
    maxAge: SESS_LIFETIME,
    sameSite: true,
    secure: IN_PROD
  }
}))
app.use(express.json());

app.use('/owner', owner)
app.use('/misc', misc)
app.use('/employee', employee)
app.use('/customer', customer)
app.use('/job', job)


const PORT = 3001;

const oneDay = 1000 * 60 * 60 * 24;

app.listen(PORT, async () => {
  console.log(`qaervice app backend listening on port ${PORT}`);
  await client.connect();
  console.log('Checking Posgres connection...');
  let res = await client.query('SELECT NOW()');
  if  (!res) {
    return;
  };
  console.log('postgres OK');
})
