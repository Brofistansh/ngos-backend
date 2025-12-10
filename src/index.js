const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('../config');

const app = express();

// ------------------------------
// GLOBAL MIDDLEWARES
// ------------------------------
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// ------------------------------
// PUBLIC ROUTES (NO API KEY REQUIRED)
// ------------------------------
app.get('/', (req, res) => {
  res.json({ status: "OK", message: "NGO Backend is Running 🔥" });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth routes MUST be public (no API key)
app.use('/auth', require('./routes/auth'));

// ------------------------------
// API KEY MIDDLEWARE (after auth)
// ------------------------------
const apiKeyMiddleware = require('./middlewares/apiKeyMiddleware');
app.use(apiKeyMiddleware);

// ------------------------------
// PROTECTED ROUTES
// ------------------------------
app.use('/api/ngos', require('./routes/ngo'));
app.use('/api/centers', require('./routes/center'));
app.use('/api/users', require('./routes/user'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/students', require('./routes/student'));
app.use('/api/student-attendance', require('./routes/studentAttendance'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/donors', require('./routes/donor'));
app.use('/api/donations', require('./routes/donation'));
app.use('/api/reports/donations', require('./routes/donationReports'));

app.use('/api/zones', require('./routes/zoneRoutes'));
app.use('/api/managers', require('./routes/managerRoutes'));

// Swagger docs
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ------------------------------
// TEMP DATABASE SYNC FIX (FOR LOGIN)
// ------------------------------
const sequelize = require('./db/postgres');
sequelize.authenticate()
  .then(() => sequelize.sync({ alter: true }))   // << Important Fix 🔥
  .then(() => console.log("🔄 DB synced (temporary alter enabled)"))
  .catch(err => console.error("❌ DB Sync Error:", err));

// ------------------------------
// GLOBAL ERROR HANDLER
// ------------------------------
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map(e => e.message)
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'Duplicate entry' });
  }

  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ------------------------------
// START SERVER
// ------------------------------
app.listen(config.PORT, () => {
  console.log(`🚀 Server started on port ${config.PORT}`);
  console.log(`📝 Environment: ${config.NODE_ENV}`);
});

module.exports = app;
