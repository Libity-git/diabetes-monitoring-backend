// 📁 File: src/middlewares/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // ตรวจสอบว่ามี Authorization header และในนั้นมี token อยู่หรือไม่
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'ไม่มี token' });
  }

  const token = authHeader.split(' ')[1];  // ดึง token จาก Bearer token

  // ถ้าไม่มี token ใน header
  if (!token) {
    return res.status(401).json({ error: 'ไม่มี token' });
  }

  try {
    // ตรวจสอบ token ว่าถูกต้องไหม
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // เพิ่มข้อมูลผู้ใช้ใน request
    req.user = decoded;

    // ถ้าผ่านการตรวจสอบ ให้ดำเนินการใน middleware ถัดไป
    next();
  } catch (err) {
    // หาก token ไม่ถูกต้อง หรือหมดอายุ
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token หมดอายุ' });
    }
    return res.status(403).json({ error: 'Token ไม่ถูกต้อง' });
  }
};
