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

const write_img_to_db = async (files, id) => {
  if (!files.file[0])
  {
    throw new Error('must attach img')
  }
  const img_path = files.file[0].filepath
  const data = fs.readFileSync(img_path)
  console.log(data)
  let query = 'INSERT INTO public."Photo" ("employeeId", img) VALUES ($1, $2) RETURNING *'
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

  const form = new formidable.IncomingForm({})
  const upload = await form.parse(req, (err, fields, files) => 
  {
    if (err)
    {
      res.status(500).send({'error': err})
    }
    try 
    {
      write_img_to_db(files, employee.id)
        .then(img => 
        {
          return res.status(201).send({'id': img.id})
        })
    } catch(err)
    {
      res.status(500).send({'error': err})
    }
    return files
  })
})

router.get('/', async (req, res) => 
{
  if (!(req.session && req.session.type === 'Employee'))
  {
    return res.status(401).send({'error': 'must be logged in as employee'})
  }
  
  if (!req.body.id) 
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
  values = [req.body.id]
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
