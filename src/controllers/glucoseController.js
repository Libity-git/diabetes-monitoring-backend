// 📁 src/controllers/glucoseController.js
const prisma = require('../utils/prisma');

exports.createReport = async (req, res) => {
  const { patientId, bloodSugar, mealTime, systolic, diastolic, recordedAt, pulse } = req.body;
  try {
    // คำนวณสถานะน้ำตาลในเลือด
    let bloodSugarStatus;
    if (!bloodSugar) {
      bloodSugarStatus = null;
    } else if (mealTime === 'before') {
      if (bloodSugar < 70) bloodSugarStatus = 'ต่ำ';
      else if (bloodSugar <= 100) bloodSugarStatus = 'ปกติ';
      else if (bloodSugar <= 125) bloodSugarStatus = 'สูง';
      else bloodSugarStatus = 'เสี่ยงสูง';
    } else { // after หรือ other
      if (bloodSugar < 70) bloodSugarStatus = 'ต่ำ';
      else if (bloodSugar < 140) bloodSugarStatus = 'ปกติ';
      else if (bloodSugar <= 199) bloodSugarStatus = 'สูง';
      else bloodSugarStatus = 'เสี่ยงสูง';
    }

    // คำนวณสถานะความดันโลหิต
    let systolicStatus;
    if (!systolic) {
      systolicStatus = null;
    } else if (systolic < 90) systolicStatus = 'ต่ำ';
    else if (systolic <= 129) systolicStatus = 'ปกติ';
    else if (systolic <= 139) systolicStatus = 'สูง';
    else systolicStatus = 'เสี่ยงสูง';

    const report = await prisma.report.create({
      data: {
        patientId,
        bloodSugar: bloodSugar || 0,
        mealTime: mealTime || 'other',
        systolic: systolic || 0,
        diastolic: diastolic || 0,
        pulse: pulse || null,
        recordedAt: new Date(recordedAt),
        createdAt: new Date(),
        bloodSugarStatus,
        systolicStatus,
      },
    });
    res.status(201).json({ message: 'บันทึกสำเร็จ', report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
};

exports.getReportsByPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const reports = await prisma.report.findMany({
      where: { patientId: Number(patientId) },
      orderBy: { recordedAt: 'desc' },
    });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
};