// 📁 File: src/controllers/adminController.js
const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

// ดึงแอดมินทั้งหมด
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, username: true, createdAt: true }
    });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ดูแลได้' });
  }
};

// สร้างแอดมินใหม่
exports.createAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
      data: { username, passwordHash },
      select: { id: true, username: true, createdAt: true }
    });

    res.json(newAdmin);
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถสร้างผู้ดูแลได้' });
  }
};

// ลบแอดมิน
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.admin.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถลบผู้ดูแลได้' });
  }
};

exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    const dataToUpdate = { username };
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      dataToUpdate.passwordHash = hashed;
    }

    const updated = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'อัปเดตแอดมินไม่สำเร็จ' });
  }
}
