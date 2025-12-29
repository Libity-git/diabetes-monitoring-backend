// 📁 src/controllers/reportController.js
const prisma = require('../utils/prisma');
const { startOfDay, endOfDay, parseISO } = require('date-fns');

exports.getHighSugarAndHighPressureReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dayStart, dayEnd;

    // ตรวจสอบและกำหนดช่วงวันที่
    if (startDate && endDate) {
      const parsedStart = parseISO(startDate);
      const parsedEnd = parseISO(endDate);
      if (isNaN(parsedStart) || isNaN(parsedEnd)) {
        return res.status(400).json({ error: 'วันที่เริ่มต้นหรือวันที่สิ้นสุดไม่ถูกต้อง' });
      }
      if (parsedStart > parsedEnd) {
        return res.status(400).json({ error: 'วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด' });
      }
      dayStart = startOfDay(parsedStart);
      dayEnd = endOfDay(parsedEnd);
    } else {
      // ถ้าไม่ระบุช่วงวันที่ ใช้วันที่ปัจจุบัน (ตามเวลาของระบบ 07/06/2025 14:40)
      const currentDate = new Date();
      dayStart = startOfDay(currentDate);
      dayEnd = endOfDay(currentDate);
    }

    const highSugarAndPressureReports = await prisma.report.findMany({
      where: {
        recordedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        OR: [
          { bloodSugarStatus: 'เสี่ยงสูง' },
          { systolicStatus: 'เสี่ยงสูง' },
        ],
      },
      include: {
        patient: true,
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });

    res.json(highSugarAndPressureReports);
  } catch (err) {
    console.error('Error in getHighSugarAndHighPressureReports:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลได้' });
  }
};

exports.getSummaryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dayStart, dayEnd;

    // ตรวจสอบและกำหนดช่วงวันที่
    if (startDate && endDate) {
      const parsedStart = parseISO(startDate);
      const parsedEnd = parseISO(endDate);
      if (isNaN(parsedStart) || isNaN(parsedEnd)) {
        return res.status(400).json({ error: 'วันที่เริ่มต้นหรือวันที่สิ้นสุดไม่ถูกต้อง' });
      }
      if (parsedStart > parsedEnd) {
        return res.status(400).json({ error: 'วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด' });
      }
      dayStart = startOfDay(parsedStart);
      dayEnd = endOfDay(parsedEnd);
    } else {
      // ถ้าไม่ระบุช่วงวันที่ ใช้วันที่ปัจจุบัน
      const currentDate = new Date();
      dayStart = startOfDay(currentDate);
      dayEnd = endOfDay(currentDate);
    }

    const highSugar = await prisma.report.count({
      where: {
        recordedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        bloodSugarStatus: 'สูง',
      },
    });

    const lowSugar = await prisma.report.count({
      where: {
        recordedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        bloodSugarStatus: 'ต่ำ',
      },
    });

    const highPressure = await prisma.report.count({
      where: {
        recordedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        systolicStatus: 'สูง',
      },
    });

    const lowPressure = await prisma.report.count({
      where: {
        recordedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        systolicStatus: 'ต่ำ',
      },
    });

    const totalReportsToday = await prisma.report.count({
      where: {
        recordedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    res.json({
      highSugarToday: highSugar,
      lowSugarToday: lowSugar,
      highPressureToday: highPressure,
      lowPressureToday: lowPressure,
      totalReportsToday: totalReportsToday,
    });
  } catch (err) {
    console.error('Error in getSummaryStats:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลได้' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dayStart, dayEnd;

    // ตรวจสอบและกำหนดช่วงวันที่
    if (startDate && endDate) {
      const parsedStart = parseISO(startDate);
      const parsedEnd = parseISO(endDate);
      if (isNaN(parsedStart) || isNaN(parsedEnd)) {
        return res.status(400).json({ error: 'วันที่เริ่มต้นหรือวันที่สิ้นสุดไม่ถูกต้อง' });
      }
      if (parsedStart > parsedEnd) {
        return res.status(400).json({ error: 'วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด' });
      }
      dayStart = startOfDay(parsedStart);
      dayEnd = endOfDay(parsedEnd);
    } else {
      // ถ้าไม่ระบุช่วงวันที่ ใช้วันที่ปัจจุบัน
      const currentDate = new Date();
      dayStart = startOfDay(currentDate);
      dayEnd = endOfDay(currentDate);
    }

    const allReports = await prisma.report.findMany({
      where: {
        recordedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        patient: true,
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });

    res.json(allReports);
  } catch (err) {
    console.error('Error in getAllReports:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลได้' });
  }
};

// ➕ Admin สร้างรายงานแทนผู้ป่วย (Option A)
exports.createReportManual = async (req, res) => {
  try {
    const { 
      patientId,
      bloodSugar, 
      mealTime, 
      systolic, 
      diastolic, 
      pulse,
      bloodSugarStatus,
      systolicStatus 
    } = req.body;

    // ตรวจสอบว่ามีผู้ป่วยหรือไม่
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(patientId) }
    });

    if (!patient) {
      return res.status(404).json({ error: 'ไม่พบผู้ป่วย' });
    }

    // Validation
    if (!bloodSugar && !systolic) {
      return res.status(400).json({ error: 'กรุณากรอกค่าน้ำตาลหรือความดันอย่างน้อย 1 อย่าง' });
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
        `${patient.name} มีค่าน้ำตาล ${bloodSugar} mg/dL (${bloodSugarStatus}) - กรอกโดยเจ้าหน้าที่`,
        patient.id
      );
    }
    
    if (systolicStatus === 'เสี่ยงสูง' || systolicStatus === 'สูง') {
      await createNotification(
        'high_pressure',
        'แจ้งเตือน: ความดันสูง',
        `${patient.name} มีค่าความดัน ${systolic}/${diastolic} mmHg (${systolicStatus}) - กรอกโดยเจ้าหน้าที่`,
        patient.id
      );
    }

    res.status(201).json({
      message: 'บันทึกข้อมูลสำเร็จ',
      report
    });
  } catch (error) {
    console.error('Error creating manual report:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
};