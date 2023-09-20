const express = require('express')
const router = express.Router()
const client = require('../utils/db')

const EMAIL_REG_EXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

router.post('/create', async (req, res) => 
{
  let
  {
    name,
    email
  } = req.body
  
  if (!(req.session.type === 'Owner' && req.session.uid))
  {
    return res.status(401).send({'error': 'must be logged in as Owner'})
  }
  if (!(name && email))
  {
    return res.status(400).send({'error': 'must provide name and email'})
  }

  email = email.toLowerCase()
  email = email.trim()

  if (!email.match(EMAIL_REG_EXP))
  {
    return res.status(400).send({'error': 'invalid email'})
  }

  let query = 'SELECT * FROM public."Customer" WHERE email = $1 AND "ownerId" = $2'
  let values = [email, req.session.uid]
  let DB_RES = await client.query(query, values)

  if (DB_RES.rowCount !== 0)
  {
    return res.status(409).send({'error': 'employee exists'})
  }

  query = 'INSERT INTO public."Customer" (name, email, "ownerId") VALUES ($1, $2, $3) RETURNING *'
  values = [name, email, req.session.uid]
  DB_RES = await client.query(query, values)

  if (DB_RES.rowCount !== 1)
  {
    return res.status(500).end()
  }
  return res.status(201).end()

})

module.exports = router
