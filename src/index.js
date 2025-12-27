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
// 🔥 LOAD SEQUELIZE MODELS & ASSOCIATIONS (CRITICAL)
// ------------------------------
require('./models/sequelize'); // ✅ DO NOT REMOVE

// ------------------------------
// PUBLIC ROUTES
// ------------------------------
app.get('/', (req, res) => {
  res.json({ status: "OK", message: "NGO Backend is Running 🔥" });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth routes (NO API key)
app.use('/auth', require('./routes/auth'));

// ------------------------------
// API KEY MIDDLEWARE
// ------------------------------
const apiKeyMiddleware = require('./middlewares/apiKeyMiddleware');
app.use(apiKeyMiddleware);

// ------------------------------
// PROTECTED ROUTES
// ------------------------------
app.use('/api/ngos', require('./routes/ngo'));
app.use('/api/ngos', require('./routes/center'));
app.use('/api/users', require('./routes/user'));

app.use('/api/students', require('./routes/student')); // ✅ ONLY ONCE

// app.use('/api/student-attendance-legacy', require('./routes/studentAttendance'));
app.use('/api/teacher-attendance', require('./routes/teacherAttendance'));

app.use('/api/teachers', require('./routes/teacher'));
app.use('/api/managers/create', require('./routes/managerCreateRoutes'));

app.use('/api/donors', require('./routes/donor'));
app.use('/api/donations', require('./routes/donation'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/reports/donations', require('./routes/donationReports'));
app.use('/api/zones', require('./routes/zoneRoutes'));

// ------------------------------
// TIMESHEETS & PERFORMANCE
// ------------------------------
app.use('/api/student-timesheet', require('./routes/studentTimesheet'));
app.use('/api/teacher-timesheet', require('./routes/teacherTimesheet'));
app.use('/api/student-performance', require('./routes/studentPerformance'));

app.use("/api/stock", require("./routes/stock"));

const dailyCenterReportRoutes = require("./routes/dailyCenterReport");
app.use("/api/daily-center-report", dailyCenterReportRoutes);

const visitRoutes = require("./routes/visits");
app.use("/api/visits", visitRoutes);

// app.use("/api/student-attendance", require("./routes/studentAttendance"));

app.use("/api/student-attendance", require("./routes/studentAttendanceBulk"));

// src/index.js

const activityTypeRoutes = require("./routes/activityTypeRoutes");

app.use("/api/activity-types", activityTypeRoutes);

app.use("/api/activities", require("./routes/activities"));

app.use("/api/analytics", require("./routes/studentAnalytics"));

app.use("/api/analytics", require("./routes/centerAnalytics"));


// ------------------------------
// SWAGGER DOCS
// ------------------------------
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ------------------------------
// DB CONNECTION
// ------------------------------
const sequelize = require('./db/postgres');

(async () => {
  try {
    await sequelize.authenticate();
    console.log("🟢 PostgreSQL Connected");

    await sequelize.sync();
    console.log("🟢 Database synced without alter");
  } catch (error) {
    console.error("❌ Database Sync Error:", error.message);
  }
})();

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
