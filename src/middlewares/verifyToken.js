// 📁 src/middlewares/verifyToken.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ตรวจสอบว่า Authorization header มีค่าหรือไม่ และตรวจสอบรูปแบบที่ถูกต้อง
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ไม่ได้รับ token หรือรูปแบบไม่ถูกต้อง' });
  }

  const token = authHeader.split(' ')[1];  // ดึง token จาก Bearer token

  // ตรวจสอบการตรวจสอบ token และส่งข้อมูลผู้ใช้ (decoded) ไปยัง request
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // แนบข้อมูล admin ไปใน request สำหรับใช้งานในขั้นตอนถัดไป
    req.admin = decoded;

    // ดำเนินการต่อไป
    next();
  } catch (err) {
    // หาก token หมดอายุ หรือไม่ถูกต้อง
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token หมดอายุ' });
    }
    return res.status(403).json({ error: 'Token ไม่ถูกต้อง' });
  }
};

module.exports = verifyToken;

