const express = require('express')
const router = express.Router()
const client = require('../utils/db')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')

const options = 
{
  maxFiles: 1
}

const waitFile = (path, timeout, callback) =>
{
  // wait for file to exist, then perform callback
  const timeoutId = setTimeout(() => {
    fs.unwatchFile(path, this)
    timeout()
  }, 10000)
  fs.watchFile(path, {interval: 50}, (event, trigger) => 
  {
    if(event.size !== 0)
    {
      clearTimeout(timeoutId)
      fs.unwatchFile(path, this)
      callback()
    }
  })
}

const write_img_to_db = async (filepath, id) => {
  const data = fs.readFileSync(filepath)
  let query = 'INSERT INTO public."Photo" ("employeeId", img) VALUES ($1, $2) RETURNING id'
  let values = [id, data]
  let DB_RES = await client.query(query, values)
  return DB_RES.rows[0]
}

router.post('/new', async (req, res) =>
{
  if (!(req.session && req.session.type === 'Employee'))
  {
    return res.status(401).send({'error': 'must be logged in as employee'})
  }


  let query = 'SELECT * FROM public."Employee" WHERE id = $1'
  let values = [req.session.uid]
  let DB_RES = await client.query(query, values)

  const employee = DB_RES.rows[0]
  
  if (!employee)
  {
    return res.status(400).send({'error': 'employee not found'})
  }
  const form = await new formidable.IncomingForm({})
  const test = await form.parse(req, (err, fields, files) => {
    if (err)
    {
      return res.status(500).send({'error': err})
    }
  })
  const photo = test.openedFiles[0]
  if (!photo)
  {
    return res.status(400).send({'error': 'must attach file'})
  }
  console.log(photo.filepath)
  const timeout = () => 
  {
    return res.status(500).send({'error': 'error reading file'})
  }
  const callback = async () => 
  {
    const id = await write_img_to_db(photo.filepath, employee.id)
    return res.status(201).send(id)
  }
  waitFile(photo.filepath, timeout, callback)
})

router.get('/', async (req, res) => 
{
  if (!(req.session && req.session.type === 'Employee'))
  {
    return res.status(401).send({'error': 'must be logged in as employee'})
  }
  
  if (!req.query.id) 
  {
    return res.status(400).send({'error': 'must include photo id'})
  }

  let query = 'SELECT * FROM public."Employee" WHERE id = $1'
  let values = [req.session.uid]
  let DB_RES = await client.query(query, values)

  const employee = DB_RES.rows[0]
  
  if (!employee)
  {
    return res.status(404).send({'error': 'employee not found'})
  }
  
  query = 'SELECT * FROM public."Photo" WHERE id = $1'
  values = [req.query.id]
  DB_RES = await client.query(query, values)
  const photo = DB_RES.rows[0]
  if (!photo)
  {
    return res.status(404).send({'error': 'photo not found'})
  }
  if (photo.employeeId !== employee.id)
  {
    return res.status(401).send({'error': 'employee not allowed access to photo'})
  }

  res.set('Content-Type', 'application/octet-stream')
  return res.status(200).send(photo.img)
})

module.exports = router
