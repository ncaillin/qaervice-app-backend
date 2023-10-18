const express = require('express')
const router = express.Router()
const client = require('../utils/db')

router.post('/create', async (req, res) => 
{
  const 
  {
    customerId,
    jobName
  } = req.body

  if (req.session.type !== 'Employee')
  {
    return res.status(401).send({'error': 'must be logged in as Employee'})
  }

  if (!(customerId && jobName))
  {
    return res.status(400).send({'error': 'must provide customerId and jobName'})
  }
  
  let query = 'SELECT * FROM public."Employee" WHERE id = $1'
  let values = [req.session.uid]
  let DB_RES = await client.query(query, values)
  const employee = DB_RES.rows[0]

  query = 'SELECT * FROM public."Customer" WHERE id = $1'
  values = [customerId]
  DB_RES = await client.query(query, values)
  const customer = DB_RES.rows[0]
  
  if (!(customer && employee))
  {
    return res.status(404).send({'error': 'employee or customer not found'})
  }

  if (customer.ownerId !== employee.ownerId)
  {
    return res.status(401).send({'error': 'not authorized to edit customer'})
  }
  query = 'INSERT INTO public."Job" ("customerId", "employeeId", "ownerId", name, "numTasks", "inProgress", "startTime") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
  values = [customerId, employee.id, employee.ownerId, jobName, 0, true, new Date()]
  DB_RES = await client.query(query, values)
  if (DB_RES.rowCount !== 1)
  {
    return res.status(500).send({'error': 'error writing to database'})
  }

  return res.status(201).end()  
})

module.exports = router


