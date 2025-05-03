// 📁 File: src/config/db.js
// (ในกรณีใช้เชื่อม db ตรง)
require('dotenv').config(); // โหลดไฟล์ .env

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

connection.connect();

module.exports = connection;
