import { default as express } from 'express'
import { client } from '../utils/db.js'
const ownerRouter = express.Router()
import { newCustomer, addOneSubscription } from '../utils/stripe.js'
import { default as bcrypt } from 'bcrypt'
import { default as dotenv } from 'dotenv'
dotenv.config()

const 
{
  FREE_PRICE,
  BCRYPT_SECRET
} = process.env


ownerRouter.post('/register', async (req, res) => // TODO: HOME REDIRECT 
{

  const EMAIL_REG_EXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  var 
  {
    email,
    password,
    name
  } = req.body


  if (!(email && password && name)) 
  {
    return res.status(400).send({'error': 'Missing email, password or name'})
  }
  
  email = email.toLowerCase()
  email = email.trim()

  if (!email.match(EMAIL_REG_EXP))
  {
    return res.status(400).send({'error': 'invalid email'})  
  }

  if (!(password.length >= 7))
  {
    return res.status(400).send({'error': 'Password must be at least 7 characters'})
  }


  let query = 'SELECT * FROM public."Owner" WHERE "email" = $1'
  let values = [email]
  let DB_RES = await client.query(query, values)

  if (!(DB_RES.rowCount === 0))
  {
    return res.status(409).send({'error': 'User exists as owner'})
  }

  query = 'SELECT * FROM public."Employee" WHERE "email" = $1'
  values = [email]
  DB_RES = await client.query(query, values)

  if (!(DB_RES.rowCount === 0))
  {
    return res.status(409).send({'error': 'User exists as employee'})
  }

  var STRIPE_RES = await newCustomer(
  {
    email,
    name
  })
  const stripeId = STRIPE_RES.id

  STRIPE_RES = await addOneSubscription(
    {
      customer: stripeId,
      subscription: FREE_PRICE
    }
  )

  const passwordHash = await bcrypt.hash(password, 10)


  query = 'INSERT INTO public."Owner" ("email", "passwordHash", "membership", "stripeId", "name") VALUES($1, $2, $3, $4, $5) RETURNING *'
  values = [email, passwordHash, 'free', stripeId, name]
  DB_RES = await client.query(query, values)

  if (DB_RES.rowCount === 0)
  {
    return res.status(500).end()
  }

  res.status(201).end()
})


export { ownerRouter }
