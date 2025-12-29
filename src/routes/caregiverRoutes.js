// 📁 src/routes/caregiverRoutes.js
const express = require('express');
const router = express.Router();
const caregiverController = require('../controllers/caregiverController');

// 🔓 Public routes (สำหรับ LIFF)
router.get('/check/:lineUserId', caregiverController.checkCaregiver);
router.post('/register', caregiverController.registerCaregiver);
router.post('/add-patient', caregiverController.addPatientToCaregiver);
router.post('/report', caregiverController.submitReportProxy);
router.post('/register-patient', caregiverController.registerPatientByCaregiver);
router.get('/search-patients', caregiverController.searchPatients);

module.exports = router;

