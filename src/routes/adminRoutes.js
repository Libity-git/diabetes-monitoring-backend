// 📁 File: src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getAllAdmins, createAdmin, deleteAdmin, updateAdmin } = require('../controllers/adminController');


const verifyToken = require('../middlewares/verifyToken');

// 🔐 ต้อง login ก่อนถึงใช้งานได้
router.get('/', verifyToken, getAllAdmins);
router.post('/', verifyToken, createAdmin);
router.delete('/:id', verifyToken, deleteAdmin);
router.put('/:id', verifyToken, updateAdmin);

module.exports = router;
