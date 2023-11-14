import { default as express } from 'express'
import { default as morgan } from 'morgan'
import { default as session } from 'express-session'
import { default as bcrypt } from 'bcrypt'
import { default as cors } from 'cors'
import { default as pg } from 'pg'
import { default as PgSession } from 'connect-pg-simple'
const pgSession = PgSession(session)
import { ownerRouter } from './routes/owner.js'
import { miscRouter } from './routes/misc.js'
import { employeeRouter } from './routes/employee.js'
import { customerRouter } from './routes/customer.js'
import { jobRouter } from './routes/job.js'
import { photoRouter } from './routes/photo.js'
import { taskRouter } from './routes/task.js'
import { client } from './utils/db.js'
import { default as dotenv } from 'dotenv'
dotenv.config()

const TWO_HOURS = 1000 * 60 * 60 * 2

const {
  SESS_LIFETIME = TWO_HOURS,
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_SECRET = '123456',
  SAME_SITE = true,
  PROXY = true,
  SESS_TABLE_NAME = 'devSessions',
  CORS_ORIGIN = 'http://localhost:3000'
} = process.env

const IN_PROD = NODE_ENV === 'production'


const app = express();
app.use(morgan('tiny'));

const pool = new pg.Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

console.log(CORS_ORIGIN)


app.use(cors({origin: CORS_ORIGIN, credentials: true}));
app.use(session({
  name: SESS_NAME,
  store: new pgSession({
    pool: pool,
    tableName: SESS_TABLE_NAME,
    createTableIfMissing: true
  }),
  resave: false,
  secret: SESS_SECRET,
  proxy: PROXY,
  saveUninitialized: false,
  cookie: {
    maxAge: SESS_LIFETIME,
    sameSite: SAME_SITE,
    secure: IN_PROD
  }
}))
app.use(express.json());

app.use('/owner', ownerRouter)
app.use('/misc', miscRouter)
app.use('/employee', employeeRouter)
app.use('/customer', customerRouter)
app.use('/job', jobRouter)
app.use('/photo', photoRouter)
app.use('/task', taskRouter)


const PORT = 3001;

const oneDay = 1000 * 60 * 60 * 24;

app.listen(PORT, async () => {
  console.log(`qaervice app backend listening on port ${PORT}`);
  await client.connect();
  console.log('Checking Posgres connection...');
  let res = await client.query('SELECT NOW()');
  if  (!res) {
    return;
  };
  console.log('postgres OK');
})
