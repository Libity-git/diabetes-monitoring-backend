// 📁 File: src/routes/lineWebhookRoutes.js
const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../controllers/lineWebhookController');

router.post('/', handleWebhook);

module.exports = router;