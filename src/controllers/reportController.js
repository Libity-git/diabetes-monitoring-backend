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