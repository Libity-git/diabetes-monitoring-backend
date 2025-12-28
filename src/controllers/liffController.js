// 📁 src/controllers/liffController.js
const prisma = require('../utils/prisma');

// ตรวจสอบว่าผู้ป่วยลงทะเบียนแล้วหรือยัง (ใช้ LINE User ID)
exports.checkPatient = async (req, res) => {
  try {
    const { lineUserId } = req.params;
    
    const patient = await prisma.patient.findUnique({
      where: { lineUserId },
      select: {
        id: true,
        name: true,
        gender: true,
        age: true,
        phone: true,
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ป่วย' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Error checking patient:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' });
  }
};

// ลงทะเบียนผู้ป่วยใหม่จาก LIFF
exports.registerPatient = async (req, res) => {
  try {
    const { lineUserId, name, gender, age, phone } = req.body;

    // Validation
    if (!lineUserId || !name || !gender || !age || !phone) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // Check if LINE user already registered
    const existingLineUser = await prisma.patient.findUnique({
      where: { lineUserId }
    });

    if (existingLineUser) {
      return res.status(400).json({ error: 'LINE account นี้ลงทะเบียนแล้ว' });
    }

    // Check if phone already exists
    const existingPhone = await prisma.patient.findUnique({
      where: { phone }
    });

    if (existingPhone) {
      return res.status(400).json({ error: 'เบอร์โทรศัพท์นี้ถูกใช้แล้ว' });
    }

    // Create new patient
    const newPatient = await prisma.patient.create({
      data: {
        lineUserId,
        name,
        gender,
        age: parseInt(age),
        phone,
      }
    });

    res.status(201).json({
      message: 'ลงทะเบียนสำเร็จ',
      patient: {
        id: newPatient.id,
        name: newPatient.name,
      }
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
};

// ส่งรายงานจาก LIFF
exports.submitReport = async (req, res) => {
  try {
    const { lineUserId, bloodSugar, systolic, diastolic } = req.body;

    // Find patient by LINE user ID
    const patient = await prisma.patient.findUnique({
      where: { lineUserId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'กรุณาลงทะเบียนก่อน' });
    }

    // Validation
    if (!bloodSugar && !systolic && !diastolic) {
      return res.status(400).json({ error: 'กรุณากรอกค่าน้ำตาลหรือความดัน' });
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        patientId: patient.id,
        bloodSugar: bloodSugar ? parseFloat(bloodSugar) : null,
        systolic: systolic ? parseInt(systolic) : null,
        diastolic: diastolic ? parseInt(diastolic) : null,
      }
    });

    // Check for high values and create notification
    let status = 'ปกติ';
    if (bloodSugar && parseFloat(bloodSugar) > 126) {
      status = 'น้ำตาลสูง';
    }
    if (systolic && parseInt(systolic) > 140) {
      status = status === 'ปกติ' ? 'ความดันสูง' : status + ' และความดันสูง';
    }

    res.status(201).json({
      message: 'บันทึกข้อมูลสำเร็จ',
      status,
      report: {
        id: report.id,
        bloodSugar: report.bloodSugar,
        systolic: report.systolic,
        diastolic: report.diastolic,
      }
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
};

// ดูข้อมูลสุขภาพจาก LIFF
exports.getHealthInfo = async (req, res) => {
  try {
    const { lineUserId } = req.params;

    // Find patient
    const patient = await prisma.patient.findUnique({
      where: { lineUserId },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'กรุณาลงทะเบียนก่อน' });
    }

    // Calculate stats
    const reports = patient.reports;
    const bloodSugarReports = reports.filter(r => r.bloodSugar !== null);
    const pressureReports = reports.filter(r => r.systolic !== null);

    const avgBloodSugar = bloodSugarReports.length > 0
      ? (bloodSugarReports.reduce((sum, r) => sum + r.bloodSugar, 0) / bloodSugarReports.length).toFixed(1)
      : null;

    const avgSystolic = pressureReports.length > 0
      ? Math.round(pressureReports.reduce((sum, r) => sum + r.systolic, 0) / pressureReports.length)
      : null;

    const avgDiastolic = pressureReports.length > 0
      ? Math.round(pressureReports.reduce((sum, r) => sum + r.diastolic, 0) / pressureReports.length)
      : null;

    res.json({
      patient: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
      },
      stats: {
        totalReports: reports.length,
        avgBloodSugar,
        avgSystolic,
        avgDiastolic,
      },
      recentReports: reports.map(r => ({
        id: r.id,
        bloodSugar: r.bloodSugar,
        systolic: r.systolic,
        diastolic: r.diastolic,
        createdAt: r.createdAt,
      }))
    });
  } catch (error) {
    console.error('Error getting health info:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
};

