// 📁 File: src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerPatient, getPatientByLineId } = require('../controllers/userController');

router.post('/register', registerPatient);
router.get('/:lineUserId', getPatientByLineId);

module.exports = router;