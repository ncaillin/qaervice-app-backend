const nodemailer = require("nodemailer");
require('dotenv').config()

const noreply = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.NOREPLY_EMAIL_USER,
    pass: process.env.NOREPLY_EMAIL_PASS
  }
})

const caillin = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.CAILLIN_EMAIL_USER,
    pass: process.env.CAILLIN_EMAIL_PASS
  }
})

const sendMailNoReply = ({to, subject, html}) =>
{
  noreply.sendMail({ 
    from: '"noreply" <noreply@qaervice.com>',
    to,
    subject,
    html
  })
}

module.exports = { sendMailNoReply }
