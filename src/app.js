// 📁 File: src/app.js
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const glucoseRoutes = require('./routes/glucoseRoutes');
const adminRoutes = require('./routes/adminRoutes');
const lineWebhookRoutes = require('./routes/lineWebhookRoutes');
const reportRoutes = require('./routes/reportRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/glucose', glucoseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/line-webhook', lineWebhookRoutes);
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/reports', reportRoutes);


module.exports = app;