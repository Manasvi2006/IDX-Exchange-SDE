require('dotenv').config();

require('dotenv').config();
console.log('DB_USER is:', process.env.DB_USER);
console.log('DB_HOST is:', process.env.DB_HOST);


const mysql = require('mysql2/promise'); //gets the mysql2 from the folder that was downlaoded and looks for the promise entry point

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  enableKeepAlive: true
});

module.exports = pool;