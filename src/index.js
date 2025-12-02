const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('../config');

const app = express();

// ------------------------------
// MIDDLEWARES
// ------------------------------
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ------------------------------
// HEALTH CHECK ROUTES
// ------------------------------
app.get('/', (req, res) => {
  res.json({ status: "OK", message: "NGO Backend is Running 🔥" });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ------------------------------
// ROUTES (LOAD BEFORE LISTEN)
// ------------------------------
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const ngoRoutes = require('./routes/ngo');
app.use('/ngos', ngoRoutes);

const centerRoutes = require('./routes/center');
app.use('/centers', centerRoutes);

const userRoutes = require('./routes/user');
app.use('/users', userRoutes);

const attendanceRoutes = require('./routes/attendance');
app.use('/attendance', attendanceRoutes);

const studentRoutes = require('./routes/student');
app.use('/students', studentRoutes);

const studentAttendanceRoutes = require('./routes/studentAttendance');
app.use('/student-attendance', studentAttendanceRoutes);

const reportRoutes = require('./routes/report');
app.use('/reports', reportRoutes);

const donorRoutes = require('./routes/donor');
app.use('/donors', donorRoutes);

const donationRoutes = require('./routes/donation');
app.use('/donations', donationRoutes);

const donationReportRoutes = require('./routes/donationReports');
app.use('/reports/donations', donationReportRoutes);

// ------------------------------
// POSTGRES CONNECTION
// ------------------------------
const sequelize = require('./db/postgres');

sequelize.authenticate()
  .then(() => {
    console.log("PostgreSQL connected successfully");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Models synced");
  })
  .catch((err) => {
    console.error("Database error:", err);
  });

// ------------------------------
// START SERVER
// ------------------------------
app.listen(config.PORT, () => {
  console.log(`Server started on port ${config.PORT}`);
});

module.exports = app;


const apiKeyMiddleware = require('./middleware/apiKeyMiddleware');

// apply globally to all routes
app.use(apiKeyMiddleware);
