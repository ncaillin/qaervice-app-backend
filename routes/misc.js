const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const client = require('../utils/db')

router.post('/login', async (req, res) => 
{

  let  
  {
    email,
    password
  } = req.body

  if (!(email && password))
  {
  return res.status(400).send({'error': 'Email or password missing'})
  }
  
  email = email.toLowerCase()
  email = email.trim()
  
  let query = 'SELECT "id", "passwordHash" from public."Owner" WHERE "email" = $1'
  let values = [email]
  let DB_RES = await client.query(query, values)


  if (DB_RES.rowCount > 1)
  {
    return res.status(500).end()
  }

  if (DB_RES.rowCount === 1)
  {
    if (await bcrypt.compare(password, DB_RES.rows[0].passwordHash))
    {
      req.session.uid = DB_RES.rows[0].id
      req.session.type = 'Owner'
      return res.status(200).end()
    }
    return res.status(401).send({'error': 'invalid password'})
  }

  query = 'SELECT "id", "passwordHash" from public."Employee" WHERE "email" = $1'
  values = [email]
  DB_RES = await client.query(query, values)
  
  if (DB_RES.rowCount > 1)
  {
    return res.status(500).end()
  }

  if (DB_RES.rowCount === 1)
  {
    if (await bcrypt.compare(password, DB_RES.rows[0].passwordHash))
    {
      req.session.uid = DB_RES.rows[0].id
      req.session.type = 'User'
      return res.status(200).end()
    }
    return res.status(401).send({'error': 'invalid password'})
  }


  res.status(404).end()
})

module.exports = router
