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

    // Check if phone already exists (use findFirst since phone is not unique)
    const existingPhone = await prisma.patient.findFirst({
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
    const { 
      lineUserId, 
      bloodSugar, 
      mealTime, 
      systolic, 
      diastolic, 
      pulse,
      bloodSugarStatus,
      systolicStatus 
    } = req.body;

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

    // Create report with all fields
    const report = await prisma.report.create({
      data: {
        patientId: patient.id,
        bloodSugar: bloodSugar ? parseFloat(bloodSugar) : null,
        mealTime: mealTime || null,
        systolic: systolic ? parseInt(systolic) : null,
        diastolic: diastolic ? parseInt(diastolic) : null,
        pulse: pulse ? parseInt(pulse) : null,
        bloodSugarStatus: bloodSugarStatus || null,
        systolicStatus: systolicStatus || null,
      }
    });

    // Check for high values and create notification
    let status = 'ปกติ';
    const { createNotification } = require('./notificationController');
    
    if (bloodSugarStatus === 'เสี่ยงสูง' || bloodSugarStatus === 'สูง') {
      status = 'น้ำตาลสูง';
      await createNotification(
        'high_sugar',
        'แจ้งเตือน: น้ำตาลสูง',
        `${patient.name} มีค่าน้ำตาล ${bloodSugar} mg/dL (${bloodSugarStatus})`,
        patient.id
      );
    }
    
    if (systolicStatus === 'เสี่ยงสูง' || systolicStatus === 'สูง') {
      status = status === 'ปกติ' ? 'ความดันสูง' : status + ' และความดันสูง';
      await createNotification(
        'high_pressure',
        'แจ้งเตือน: ความดันสูง',
        `${patient.name} มีค่าความดัน ${systolic}/${diastolic} mmHg (${systolicStatus})`,
        patient.id
      );
    }

    res.status(201).json({
      message: 'บันทึกข้อมูลสำเร็จ',
      status,
      report: {
        id: report.id,
        bloodSugar: report.bloodSugar,
        mealTime: report.mealTime,
        systolic: report.systolic,
        diastolic: report.diastolic,
        bloodSugarStatus: report.bloodSugarStatus,
        systolicStatus: report.systolicStatus,
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

