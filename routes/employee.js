const express = require('express')
const router = express.Router()
const redirect = require('../utils/redirects')
const client = require('../utils/db')
const mailer = require('../utils/mailer')
const crypto = require('crypto')

const EMAIL_REG_EXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

router.post('/create', redirect.redirectOwner, async (req, res) => 
{
  let
  {
    name,
    email
  } = req.body
  if(!(name && email))
  {
    return res.status(400).send({'error': 'missing name or email'})  
  }

  email = email.toLowerCase()
  email = email.trim()
  if(!email.match(EMAIL_REG_EXP))
  {
    return res.status(400).send({'error': 'invalid email address'})
  }
  if (!(req.session.uid && req.session.type === 'Owner'))
  {
    return res.status(401).end()
  }

  let query = 'SELECT * FROM public."Employee" WHERE email = $1'
  let values = [email]
  let DB_RES = await client.query(query, values)
  
  if (DB_RES.rowCount !== 0)
  {
    return res.status(409).send({'error': 'User exists with email'}) 
  }
  query = 'SELECT * FROM public."Owner" WHERE email = $1'
  values = [email]
  DB_RES = await client.query(query, values)
  
  if (DB_RES.rowCount !== 0)
  {
    return res.status(409).send({'error': 'User exists with email'}) 
  }
  
  const identifierStr = `${req.session.uid.toString()}${crypto.randomBytes(20).toString('hex')}`
  

  query = 'INSERT INTO public."Employee" (name, email, "identifierStr", "ownerId", active) VALUES ($1, $2, $3, $4, $5) RETURNING *'
  values = [name, email, identifierStr, req.session.uid, false]
  DB_RES = await client.query(query, values)
  if (DB_RES.rowCount !== 1)
  {
    return res.status(500).end()
  }

  await mailer.sendMailNoReply(
  {
    to: email,
    subject: 'Your manager has signed you up!',
    html: `
    <!DOCTYPE HTML>
    <html>
      <body>
        <h1>Welcome!</h1>
        <p>Hi ${name}! Your manager has signed you up for qaervice.</p>
        <p>Click the link below to set your password:</p>
        <a href="https://qaervice.com/employee/register?id=${identifierStr}">Set my password</a>
        <br>
        <p>If this was sent in error, please disregard and delete this email.</p>
        <p>Warm regards, and glad to have you on board!</p>
        <p>The qaervice team</p>
      </body>
    </html>
    `
  })

  res.status(201).end()
})

module.exports = router

