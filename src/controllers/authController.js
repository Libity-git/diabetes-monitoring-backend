// 📁 File: src/controllers/authController.js
const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // ค้นหาผู้ดูแลที่มีชื่อผู้ใช้ที่ตรงกับที่รับมาจากฟอร์ม
    const admin = await prisma.admin.findUnique({ where: { username } });

    // ตรวจสอบว่าไม่พบผู้ใช้หรือรหัสผ่านไม่ตรงกัน
    if (!admin) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // ตรวจสอบรหัสผ่านที่ได้รับจากฟอร์มกับรหัสผ่านที่เก็บไว้ในฐานข้อมูล
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง JWT token
    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // ส่งคืน token
    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
};
