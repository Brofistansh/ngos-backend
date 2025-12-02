const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('../config');

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// ------------------------------
// TEST ROUTES
// ------------------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('NGO Backend is Running 🔥');
});
// AUTH ROUTES
// const authRoutes = require('./routes/auth');
// app.use('/auth', authRoutes);
// e.g. src/index.js or src/server.js
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);



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

const ngoRoutes = require('./routes/ngo');
app.use('/ngos', ngoRoutes);

const centerRoutes = require('./routes/center');
app.use('/ngos', centerRoutes);

// after other routes (auth, ngo, center...)
const userRoutes = require('./routes/user');
app.use('/users', userRoutes);

const attendanceRoutes = require('./routes/attendance');
app.use('/attendance', attendanceRoutes);

const studentRoutes = require('./routes/student');
const studentAttendanceRoutes = require('./routes/studentAttendance');

app.use('/students', studentRoutes);
app.use('/student-attendance', studentAttendanceRoutes);

const reportRoutes = require('./routes/report');
app.use('/reports', reportRoutes);

const donorRoutes = require('./routes/donor');
const donationRoutes = require('./routes/donation');

app.use('/donors', donorRoutes);
app.use('/donations', donationRoutes);

const donationReportRoutes = require('./routes/donationReports');
app.use('/reports/donations', donationReportRoutes);

