// 📁 File: src/controllers/userController.js
const prisma = require('../utils/prisma');

exports.registerPatient = async (req, res) => {
  const { lineUserId, name, gender, age, phone } = req.body;
  try {
    const existing = await prisma.patient.findUnique({ where: { lineUserId } });
    if (existing) return res.status(200).json({ message: 'ผู้ใช้มีอยู่แล้ว', patient: existing });

    const patient = await prisma.patient.create({
      data: { lineUserId, name, gender, age, phone }
    });
    res.status(201).json({ message: 'ลงทะเบียนสำเร็จ', patient });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
};

exports.getPatientByLineId = async (req, res) => {
  const { lineUserId } = req.params;
  try {
    const patient = await prisma.patient.findUnique({ where: { lineUserId } });
    if (!patient) return res.status(404).json({ error: 'ไม่พบผู้ป่วย' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
};