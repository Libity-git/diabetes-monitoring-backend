// 📁 File: src/routes/glucoseRoutes.js
const express = require('express');
const router = express.Router();
const { createReport, getReportsByPatient } = require('../controllers/glucoseController');

router.post('/', createReport);
router.get('/:patientId', getReportsByPatient);

module.exports = router;