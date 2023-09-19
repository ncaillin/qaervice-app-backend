const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const cors = require('cors');
const owner = require('./owner');
const misc = require('./misc');
const client = require('./db');
require('dotenv').config();

const TWO_HOURS = 1000 * 60 * 60 * 2

const {
  SESS_LIFETIME = TWO_HOURS,
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_SECRET = '123456',
} = process.env

const IN_PROD = NODE_ENV === 'production'


const noreply_transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.NOREPLY_EMAIL_USER,
    pass: process.env.NOREPLY_EMAIL_PASS
  }
})
const caillin_transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.CAILLIN_EMAIL_USER,
    pass: process.env.CAILLIN_EMAIL_PASS
  }
})

const app = express();
app.use(cors());
app.use(session({
  name: SESS_NAME,
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
  console.log('Checking noreply nodemailer connection...')
  let email_waiting = await noreply_transporter.verify();
  if (!email_waiting) {
    console.error('Connection error, exiting..')
    return;
  }
  console.log('noreply nodemailer OK');
  console.log('Checking caillin nodemailer connection...')
  email_waiting = await noreply_transporter.verify();
  if (!email_waiting) {
    console.error('Connection error, exiting..')
    return;
  }
  console.log('caillin nodemailer OK');
})
