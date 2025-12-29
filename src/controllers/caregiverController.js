// 📁 src/controllers/caregiverController.js
const prisma = require('../utils/prisma');

// ✅ ตรวจสอบว่าเป็นผู้ดูแลหรือไม่
exports.checkCaregiver = async (req, res) => {
  try {
    const { lineUserId } = req.params;
    
    const caregiver = await prisma.caregiver.findUnique({
      where: { lineUserId },
      include: {
        patients: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
          }
        }
      }
    });

    if (!caregiver) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ดูแล' });
    }

    res.json(caregiver);
  } catch (error) {
    console.error('Error checking caregiver:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

// ✅ ลงทะเบียนผู้ดูแล
exports.registerCaregiver = async (req, res) => {
  try {
    const { lineUserId, name, phone } = req.body;

    if (!lineUserId || !name) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
    }

    // ตรวจสอบว่าลงทะเบียนแล้วหรือยัง
    const existing = await prisma.caregiver.findUnique({
      where: { lineUserId }
    });

    if (existing) {
      return res.status(400).json({ error: 'LINE นี้ลงทะเบียนเป็นผู้ดูแลแล้ว' });
    }

    const caregiver = await prisma.caregiver.create({
      data: {
        lineUserId,
        name,
        phone: phone || null,
      }
    });

    res.status(201).json({
      message: 'ลงทะเบียนผู้ดูแลสำเร็จ',
      caregiver
    });
  } catch (error) {
    console.error('Error registering caregiver:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
};

// ✅ เพิ่มผู้ป่วยให้ผู้ดูแล (เชื่อมโยง)
exports.addPatientToCaregiver = async (req, res) => {
  try {
    const { lineUserId, patientId } = req.body;

    const caregiver = await prisma.caregiver.findUnique({
      where: { lineUserId }
    });

    if (!caregiver) {
      return res.status(404).json({ error: 'ไม่พบผู้ดูแล กรุณาลงทะเบียนก่อน' });
    }

    // เชื่อมโยงผู้ป่วยกับผู้ดูแล
    await prisma.caregiver.update({
      where: { lineUserId },
      data: {
        patients: {
          connect: { id: parseInt(patientId) }
        }
      }
    });

    res.json({ message: 'เพิ่มผู้ป่วยสำเร็จ' });
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

// ✅ ส่งข้อมูลแทนผู้ป่วย (Proxy mode)
exports.submitReportProxy = async (req, res) => {
  try {
    const { 
      caregiverLineUserId,
      patientId,
      bloodSugar, 
      mealTime, 
      systolic, 
      diastolic, 
      pulse,
      bloodSugarStatus,
      systolicStatus 
    } = req.body;

    // ตรวจสอบว่าเป็นผู้ดูแลจริง
    const caregiver = await prisma.caregiver.findUnique({
      where: { lineUserId: caregiverLineUserId },
      include: { patients: true }
    });

    if (!caregiver) {
      return res.status(404).json({ error: 'ไม่พบผู้ดูแล' });
    }

    // ตรวจสอบว่าผู้ดูแลดูแลผู้ป่วยคนนี้จริง
    const isAuthorized = caregiver.patients.some(p => p.id === parseInt(patientId));
    if (!isAuthorized) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ส่งข้อมูลแทนผู้ป่วยคนนี้' });
    }

    // หาข้อมูลผู้ป่วย
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(patientId) }
    });

    if (!patient) {
      return res.status(404).json({ error: 'ไม่พบผู้ป่วย' });
    }

    // บันทึก report
    const report = await prisma.report.create({
      data: {
        patientId: parseInt(patientId),
        bloodSugar: bloodSugar ? parseFloat(bloodSugar) : null,
        mealTime: mealTime || null,
        systolic: systolic ? parseInt(systolic) : null,
        diastolic: diastolic ? parseInt(diastolic) : null,
        pulse: pulse ? parseInt(pulse) : null,
        bloodSugarStatus: bloodSugarStatus || null,
        systolicStatus: systolicStatus || null,
      }
    });

    // สร้าง notification ถ้าค่าสูง
    const { createNotification } = require('./notificationController');
    
    if (bloodSugarStatus === 'เสี่ยงสูง' || bloodSugarStatus === 'สูง') {
      await createNotification(
        'high_sugar',
        'แจ้งเตือน: น้ำตาลสูง',
        `${patient.name} มีค่าน้ำตาล ${bloodSugar} mg/dL (${bloodSugarStatus}) - ส่งโดย ${caregiver.name}`,
        patient.id
      );
    }
    
    if (systolicStatus === 'เสี่ยงสูง' || systolicStatus === 'สูง') {
      await createNotification(
        'high_pressure',
        'แจ้งเตือน: ความดันสูง',
        `${patient.name} มีค่าความดัน ${systolic}/${diastolic} mmHg (${systolicStatus}) - ส่งโดย ${caregiver.name}`,
        patient.id
      );
    }

    res.status(201).json({
      message: 'บันทึกข้อมูลสำเร็จ',
      report
    });
  } catch (error) {
    console.error('Error submitting proxy report:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
};

// ✅ ลงทะเบียนผู้ป่วยใหม่โดยผู้ดูแล (ผู้ป่วยไม่มี LINE)
exports.registerPatientByCaregiver = async (req, res) => {
  try {
    const { caregiverLineUserId, name, gender, age, phone } = req.body;

    // ตรวจสอบผู้ดูแล
    const caregiver = await prisma.caregiver.findUnique({
      where: { lineUserId: caregiverLineUserId }
    });

    if (!caregiver) {
      return res.status(404).json({ error: 'ไม่พบผู้ดูแล กรุณาลงทะเบียนเป็นผู้ดูแลก่อน' });
    }

    // Validation
    if (!name || !gender || !age) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
    }

    // ตรวจสอบเบอร์โทร
    if (phone) {
      const existingPhone = await prisma.patient.findFirst({
        where: { phone }
      });
      if (existingPhone) {
        return res.status(400).json({ error: 'เบอร์โทรศัพท์นี้ถูกใช้แล้ว' });
      }
    }

    // สร้างผู้ป่วยใหม่ (ไม่มี lineUserId)
    const patient = await prisma.patient.create({
      data: {
        name,
        gender,
        age: parseInt(age),
        phone: phone || '',
        lineUserId: null, // ไม่มี LINE
        caregivers: {
          connect: { id: caregiver.id }
        }
      }
    });

    // สร้าง notification
    const { createNotification } = require('./notificationController');
    await createNotification(
      'new_patient',
      'ผู้ป่วยใหม่ลงทะเบียน',
      `${name} ลงทะเบียนโดย ${caregiver.name} (ไม่มี LINE)`,
      patient.id
    );

    res.status(201).json({
      message: 'ลงทะเบียนผู้ป่วยสำเร็จ',
      patient
    });
  } catch (error) {
    console.error('Error registering patient by caregiver:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
};

// ✅ ค้นหาผู้ป่วย (สำหรับผู้ดูแลเพิ่มเข้าระบบ)
exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อหรือเบอร์อย่างน้อย 2 ตัวอักษร' });
    }

    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } }
        ]
      },
      select: {
        id: true,
        name: true,
        age: true,
        phone: true,
      },
      take: 10
    });

    res.json(patients);
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

