const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const pg = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const client = new pg.Client({
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: 'qaervice-dev-db',
});


const app = express();
app.use(express.json());
const PORT = 3001;

const oneDay = 1000 * 60 * 60 * 24;


app.post('/api/v1/login', async (req, res) => {
  try {
    const user = req.body.email.toLowerCase();
    const password = req.body.password;
    
    
    let query = 'SELECT "Username", "PasswordHash" FROM public."Users" WHERE "Username" = $1'
    let values = [user];
    let DB_res = await client.query(query, values)
    if (DB_res.rowCount == 0) {
      res.status(404).send({"error": "No user associated with email"})
      return;
    }
    console.log(DB_res.rows[0]);

    res.status(200).send('Success');
  } catch (err) {
    res.status(500).send({"error": err})
  }

})

app.post('/api/v1/register', async (req, res) => {
  try {
    
    const user = req.body.email.toLowerCase();
    const password = req.body.password;
    
    // input validation

    if (!user.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      res.status(400).send({"error": "Invalid email or password"});
      return;
    }

    if (!(password.length >= 8)) {
      res.status(400).send({"error": "Invalid email or password"});
      return;
    }

    // check email not in db


    let query = 'SELECT "Username" FROM public."Users" WHERE "Username" = $1'
    let values = [user];
    let DB_res = await client.query(query, values)
    if (DB_res.rowCount !== 0) {
      res.status(409).send({"error": "User Exists with that email"})
      return;
    }

    // create password hash
    
    bcrypt.hash(password, 10)
      .then(hash => {
        //add user to DB
        query = 'INSERT INTO public."Users"("Username", "PasswordHash") VALUES($1, $2) RETURNING *'
        values = [user, hash]
        client.query(query, values).then(response => {
          console.log(response.rows[0])
        })
      }).then(foo => {
        res.status(201).send("User Created") 
      })
    
  } catch(err) {
    res.status(401).send({error: 'unexpected error'})
    console.log(err)
  }
})


app.listen(PORT, () => {
  console.log(`QAervice app backend listening on port ${PORT}`)
  client.connect().then(console.log('Connected to Postgres DB'))
})
