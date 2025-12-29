const express = require('express');
const router = express.Router();

// ✅ Import controller ฟังก์ชันที่ต้องใช้
const { getSummaryStats, getAllReports, getHighSugarAndHighPressureReports, createReportManual } = require('../controllers/reportController');

// ✅ Middleware สำหรับตรวจสอบ token
const verifyToken = require('../middlewares/verifyToken');

// 🔐 ต้อง login ก่อนถึงใช้งานได้
router.get('/summary', verifyToken, getSummaryStats);   // ✅ เพิ่ม verifyToken ด้วยถ้าต้องการให้เฉพาะแอดมินดูได้
router.get('/', verifyToken, getAllReports);            // ✅ ดูรายงานทั้งหมด ต้อง login
router.get('/high-sugar-high-pressure', verifyToken, getHighSugarAndHighPressureReports); // ✅ ดูรายงานที่น้ำตาลหรือความดันสูง ต้อง login
router.post('/manual', verifyToken, createReportManual); // ✅ กรอกข้อมูลแทนผู้ป่วย (Admin)

module.exports = router;
