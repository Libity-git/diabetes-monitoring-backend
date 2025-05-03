// 📁 src/routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const verifyToken = require('../middlewares/verifyToken');

// 🟢 ดูผู้ป่วยทั้งหมด
router.get('/', verifyToken, patientController.getAllPatients);

// 🟢 ดูผู้ป่วยรายเดียว
router.get('/:id', verifyToken, patientController.getPatientById);

// 🟢 เพิ่มผู้ป่วย
router.post('/', verifyToken, patientController.createPatient);

// 🟢 แก้ไขข้อมูลผู้ป่วย
router.put('/:id', verifyToken, patientController.updatePatient);

// 🟢 ลบผู้ป่วย
router.delete('/:id', verifyToken, patientController.deletePatient);

module.exports = router;
