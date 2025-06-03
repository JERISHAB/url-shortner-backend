// db.js

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // Replace with your PostgreSQL password
  port: 5432,
});

module.exports = pool;
