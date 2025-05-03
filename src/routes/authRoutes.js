// 📁 File: src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// ปรับปรุงการตรวจสอบข้อมูลที่จำเป็นใน body ของ request
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
  }

  // ส่งต่อไปยัง controller
  next();
}, login);

module.exports = router;
