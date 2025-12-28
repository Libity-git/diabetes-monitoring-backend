// 📁 src/routes/liffRoutes.js
const express = require('express');
const router = express.Router();
const liffController = require('../controllers/liffController');

// 🟢 ตรวจสอบว่าผู้ป่วยลงทะเบียนแล้วหรือยัง
router.get('/patient/:lineUserId', liffController.checkPatient);

// 🟢 ลงทะเบียนผู้ป่วยใหม่
router.post('/register', liffController.registerPatient);

// 🟢 ส่งรายงานค่าน้ำตาล/ความดัน
router.post('/report', liffController.submitReport);

// 🟢 ดูข้อมูลสุขภาพ
router.get('/health/:lineUserId', liffController.getHealthInfo);

module.exports = router;

