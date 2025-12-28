// 📁 File: src/config/db.js
// ⚠️ ไฟล์นี้ไม่ได้ใช้งานแล้ว - ใช้ Prisma แทน
// เก็บไว้เพื่อ reference เท่านั้น

/*
// 🔴 MySQL (เดิม)
require('dotenv').config();
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
*/

// 🟢 PostgreSQL (Supabase) - ใช้ Prisma Client
// ดู src/utils/prisma.js สำหรับการเชื่อมต่อ database
// Configuration อยู่ใน .env:
// - DATABASE_URL (connection pooling)
// - DIRECT_URL (migrations)

console.log('⚠️ db.js is deprecated. Use Prisma client from src/utils/prisma.js');
module.exports = null;
