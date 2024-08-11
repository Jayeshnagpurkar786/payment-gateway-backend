const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: true
   })

pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Connection error', err.stack));

module.exports = pool;
