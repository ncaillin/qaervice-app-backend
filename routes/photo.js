const express = require('express')
const router = express.Router()
const client = require('../utils/db')
const formidable = require('formidable')
const fs = require('fs')
const uniqueFilename = require('unique-filename')
const mime = require('mime')
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
  const callback = async () => 
  {
    const buffer = fs.readFileSync(photo.filepath)
    const filename = uniqueFilename('./images')
    await fs.writeFileSync(filename, buffer)
    query = 'INSERT INTO public."Photo" ("employeeId", filepath) VALUES ($1, $2) RETURNING id'
    values = [employee.id, filename]
    DB_RES = await client.query(query, values)
    if (DB_RES.rows[0])
    {
      return res.status(201).send({'id': DB_RES.rows[0].id})
    }
  }
  const timeout = () => 
  {
    console.log('Timed out')
    return res.status(500).end()
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
  const path = `./${photo.filepath}`
  console.log(path)
  const type = mime.getType(path)
  const contents = fs.readFileSync(path, "base64")
  const dataURL = `data:${type};base64,${contents}`
  return res.status(200).send({'data': dataURL})
})

module.exports = router
