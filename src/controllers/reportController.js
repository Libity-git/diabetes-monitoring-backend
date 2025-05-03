// 📁 src/controllers/reportController.js
const prisma = require('../utils/prisma');
const { startOfDay, endOfDay, parseISO } = require('date-fns');

exports.getHighSugarAndHighPressureReports = async (req, res) => {
  try {
    const date = req.query.date ? parseISO(req.query.date) : new Date();
    if (isNaN(date)) {
      return res.status(400).json({ error: 'วันที่ไม่ถูกต้อง' });
    }
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

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
    console.error(err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลได้' });
  }
};

exports.getSummaryStats = async (req, res) => {
  try {
    const date = req.query.date ? parseISO(req.query.date) : new Date();
    if (isNaN(date)) {
      return res.status(400).json({ error: 'วันที่ไม่ถูกต้อง' });
    }
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

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
    console.error(err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลได้' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const date = req.query.date ? parseISO(req.query.date) : new Date();
    if (isNaN(date)) {
      return res.status(400).json({ error: 'วันที่ไม่ถูกต้อง' });
    }
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

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
    console.error(err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลได้' });
  }
};