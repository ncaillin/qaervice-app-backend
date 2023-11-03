const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const pg = require('pg');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const cors = require('cors');
require('dotenv').config();

const client = new pg.Client({
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: 'dev',
});

const noreply_transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.NOREPLY_EMAIL_USER,
    pass: process.env.NOREPLY_EMAIL_PASS
  }
})
const caillin_transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.CAILLIN_EMAIL_USER,
    pass: process.env.CAILLIN_EMAIL_PASS
  }
})



const app = express();
app.use(cors({origin: 'https://qaervice.com'}));
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

const sendMail = async () => {
  const info = await noreply_transporter.sendMail({
    from: '"noreply" <noreply@qaervice.com>',
    to: 'nugentcaillin@gmail.com',
    subject: 'embedded html test 2',
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
  <style type="text/css">
  .brand {
    color: blueviolet;
    font-size: 2em;
  }
  .heading {
    font-size: 3em;
    margin: auto;
    text-align: center;
  }
  .text {
    font-size: 1.4em;
  }
  .subHeading {
    font-size: 2em;
    margin: auto;
    text-align: center;
  }
  .jobTitle {
    font-size: 1em;
    color: blueviolet;
  }
  .unsubscribe {
    width: 70vw;
    margin: 0 auto;
    background-color: blueviolet;
    color: white;
    border: none;
    font-size: 1.8em;
    height: 2em;
  }
  </style>
  </head>
  <body>
    <h2 class="brand">qaervice</h2>
    <h1 class="heading">Thanks for Joining!</h1>
    <p class="text">Welcome, name. I'm so excited to have you here!<br>More information will arrive in the coming weeks.</p>
    <h3 class="subHeading">How do I get my discount?</h3>
    <p class="text">You'll recieve an email close to the release date containing a discount code. Apply this when registering to get a 15% lifetime discount.<br><br>This will apply even if you choose to select the free plan.</p>
    <h3 class="subHeading">Have any other questions?</h3>
    <p class="text">Don't hesitate to reach out! <br><br> Feel free to reply to this email and I'll get back to you as soon as I can <br><br>Warm regards,<br>Caillin Nugent</p>
    <p class="jobTitle">full stack developer | caillin@qaervice.com<br><br><br></p>
    <a href="google.com"><button class="unsubscribe">Unsubscribe</button></a>
  </body>
</html>`,
  })
  console.log(info)
}



app.get('/v1/email', async (req, res) => {
  try {
    await sendMail()
    res.status(200).end()
    


  }
  catch (err) {
    res.status(500).send({"error": err})
  }
})

app.post('/v1/validate', async (req, res) => {

  try {
    const email = req.body.email.toLowerCase().trim();
    const name = req.body.name;

    if (!email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      res.status(400).send({"error": "Invalid email"});
      return;
    }
    if (!name) {
      res.status(400).send({"error": "Please enter a name"})
    }

    let query = 'SELECT "email" FROM public."Validation" WHERE "email" = $1'
    let values = [email];
    let DB_res = await client.query(query, values)
    if (DB_res.rowCount !== 0) {
      res.status(409).send({"error": "User Exists with that email"})
      return;
    }
    let unsubscribe_hash = await bcrypt.hash(email, 10);
    query = 'INSERT INTO public."Validation"("email", "name", "subscribed", "unsubscribe_hash") VALUES($1, $2, $3, $4) RETURNING *'
    values = [email, name, true, unsubscribe_hash]
    DB_res = await client.query(query, values);
    if (!DB_res.rows) {
      res.status(500).send({"error": "Unexpected error, Please try again."})
      return;
    }
const welcome_template = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
  <style type="text/css">
  .brand {
    color: blueviolet;
    font-size: 2em;
  }
  .heading {
    font-size: 3em;
    margin: auto;
    text-align: center;
  }
  .text {
    font-size: 1.4em;
  }
  .subHeading {
    font-size: 2em;
    margin: auto;
    text-align: center;
  }
  .jobTitle {
    font-size: 1em;
    color: blueviolet;
  }
  .unsubscribe {
    width: 70vw;
    margin: 0 auto;
    background-color: blueviolet;
    color: white;
    border: none;
    font-size: 1.8em;
    height: 2em;
  }
  </style>
  </head>
  <body>
    <h2 class="brand">qaervice</h2>
    <h1 class="heading">Thanks for Joining!</h1>
    <p class="text">Welcome, ${name}. I'm so excited to have you here!<br>More information will arrive in the coming weeks.</p>
    <h3 class="subHeading">How do I get my discount?</h3>
    <p class="text">You'll recieve an email close to the release date containing a discount code. Apply this when registering to get a 15% lifetime discount.<br><br>This will apply even if you choose to select the free plan.</p>
    <h3 class="subHeading">Have any other questions?</h3>
    <p class="text">Don't hesitate to reach out! <br><br> Feel free to reply to this email and I'll get back to you as soon as I can <br><br>Warm regards,<br>Caillin Nugent</p>
    <p class="jobTitle">full stack developer | caillin@qaervice.com<br><br><br></p>
    <a href="qaervice.com/unsubscribe.html?hash=${unsubscribe_hash}"><button class="unsubscribe">Unsubscribe</button></a>
  </body>
</html>`
    res.status(201).end();

    caillin_transporter.sendMail({
    from: '"Caillin" <caillin@qaervice.com>',
    to: email,
    subject: 'Welcome to Qaervice!',
    html: welcome_template
    }).then(info => {
      console.log(info);
    })
  
  } catch (err) {
    res.status(500).end();
  }
})

app.post('/v1/unsubscribe', async (req, res) => {
  try {
    const hash = req.body.hash;
    let query = 'SELECT * FROM public."Validation" WHERE "unsubscribe_hash" = $1'
    let values = [hash];
    let DB_res = await client.query(query, values)

    query = 'DELETE FROM public."Validation" WHERE user_id = $1';
    values = [DB_res.rows[0].user_id];
    await client.query(query, values);
    console.log(`${DB_res.rows[0].name} unsubscribed`)

    res.status(200).end();
  } catch (err) {
    console.log(err)
    res.status(500).end();
  }

})

app.post('/v1/register', async (req, res) => {
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


app.listen(PORT, async () => {
  console.log(`qaervice app backend listening on port ${PORT}`);
  await client.connect();
  console.log('Checking Posgres connection...');
  let res = await client.query('SELECT NOW()');
  if  (!res) {
    return;
  };
  console.log('postgres OK');
  console.log('Checking noreply nodemailer connection...')
  let email_waiting = await noreply_transporter.verify();
  if (!email_waiting) {
    console.error('Connection error, exiting..')
    return;
  }
  console.log('noreply nodemailer OK');
  console.log('Checking caillin nodemailer connection...')
  email_waiting = await noreply_transporter.verify();
  if (!email_waiting) {
    console.error('Connection error, exiting..')
    return;
  }
  console.log('caillin nodemailer OK');
})
