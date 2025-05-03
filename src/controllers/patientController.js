const prisma = require('../utils/prisma');

// 🔍 ดึงผู้ป่วยทั้งหมด
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถดึงรายชื่อผู้ป่วยได้' });
  }
};

// 🔍 ดึงข้อมูลผู้ป่วยรายบุคคล
exports.getPatientById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { reports: { orderBy: { recordedAt: 'desc' } } },
    });
    if (!patient) return res.status(404).json({ error: 'ไม่พบผู้ป่วย' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
};

// ➕ สร้างผู้ป่วยใหม่
exports.createPatient = async (req, res) => {
  const { name, gender, age, phone, lineUserId } = req.body;
  try {
    const patient = await prisma.patient.create({
      data: { name, gender, age, phone, lineUserId },
    });
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถสร้างผู้ป่วยได้' });
  }
};

// ✏️ แก้ไขข้อมูลผู้ป่วย
exports.updatePatient = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, gender, age, phone } = req.body;
  try {
    const patient = await prisma.patient.update({
      where: { id },
      data: { name, gender, age, phone },
    });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลได้' });
  }
};

// ❌ ลบผู้ป่วย
exports.deletePatient = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.report.deleteMany({ where: { patientId: id } }); // ลบ report ก่อน
    await prisma.patient.delete({ where: { id } });
    res.json({ message: 'ลบผู้ป่วยเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถลบผู้ป่วยได้' });
  }
};
