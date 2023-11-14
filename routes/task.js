import { default as express } from 'express'
const taskRouter = express.Router()
import { client } from '../utils/db.js'


taskRouter.post('/create', async (req, res) => 
{
  let query
  let values
  let DB_RES

  const { type } = req.session
  const {
    taskName,
    jobId,
    photoId
  } = req.body
  if (!(taskName && jobId))
  {
    return res.status(400).send({'error': 'must include taskName and jobId'})
  }
  if (type !== 'Employee')
  {
    return res.status(401).send({'error': 'must have session of type Employee'})
  }
  query = 'SELECT * FROM public."Employee" WHERE id = $1'
  values = [req.session.uid]
  DB_RES = await client.query(query, values)
  const employee = DB_RES.rows[0]
  query = 'SELECT * FROM public."Job" WHERE id = $1'
  values = [jobId]
  DB_RES = await client.query(query, values)
  const job = DB_RES.rows[0]
  
  if (!(employee && job))
  {
    return res.status(404).send({'error': 'Job or Employee not found'})
  }

  if (photoId)
  {
    query = 'SELECT id, "employeeId" FROM public."Photo" WHERE id = $1'
    values = [photoId]
    DB_RES = await client.query(query, values)
    const photo = DB_RES.rows[0]
    if (!photo)
    {
      return res.status(404).send({'error': 'photo not found'})
    }
    if (photo.employeeId !== employee.id)
    {
      return res.status(401).send({'error': 'employee does not have access to photo'})
    }
  }

  if (job.employeeId !== employee.id)
  {
    return res.status(401).send({'error': 'Employee does not have permission to edit this job'})
  }
  if (job.inProgress !== true)
  {
    return res.status(400).send({'error': 'cannot edit completed job'})
  }
  const now = new Date()

  query = 'INSERT INTO public."Task" ("jobId", name, "finishTime", "photoId") VALUES ($1, $2, $3, $4) RETURNING *'
  values = [job.id, taskName, now, photoId]
  DB_RES = await client.query(query, values)
  console.log(DB_RES.rows[0])
  return res.status(201).end()
})


export { taskRouter }
